package main

import (
	"database/sql"
	"fmt"
	"github.com/gin-contrib/cors"
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/gin-gonic/gin"
	_ "github.com/go-sql-driver/mysql"
)

type LoginInput struct {
	UserName string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type CreateDeviceGroupInput struct {
	Name            string  `json:"name" binding:"required"`
	City            string  `json:"city" binding:"required"`
	WeatherWidgetId *string `json:"weatherWidgetId"`
}

func main() {
	// Replace with your actual credentials or use env vars
	dsn := fmt.Sprintf("%s:%s@tcp(%s)/%s",
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_HOST"),
		os.Getenv("DB_NAME"),
	)

	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatalf("Failed to connect to DB: %v", err)
	}
	defer func() {
		err := db.Close()
		if err != nil {
			log.Fatalf("Failed to close DB connection: %v", err)
		}
	}()

	if err := db.Ping(); err != nil {
		log.Fatalf("DB not reachable: %v", err)
	}

	r := gin.Default()

	r.Use(cors.Default())
	r.GET("/health", healthCheck(db))
	r.GET("/login", login(db))
	r.GET("/device-groups", listDeviceGroups(db))
	r.POST("/device-groups", createDeviceGroup(db))
	r.GET("/device-groups/:groupId/devices", listDevices(db))

	err = r.Run(fmt.Sprintf("0.0.0.0:%s", os.Getenv("APP_PORT")))
	if err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func healthCheck(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		if err := db.Ping(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"status": "unhealthy", "error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"status": "healthy"})
	}
}

func login(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// TODO: implement login logic
		c.JSON(http.StatusOK, gin.H{})
	}
}

func listDeviceGroups(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		pageNumber := getOptionalIntParam(c, "pageNumber", 1)
		pageSize := getOptionalIntParam(c, "pageSize", 10)
		offset := (pageNumber - 1) * pageSize
		log.Printf("limit: %d, offset: %d", pageSize, offset)
		rows, err := db.Query(
			`SELECT id, name, city, weather_widget_id 
FROM device_groups 
ORDER BY id 
LIMIT ?
OFFSET ?`,
			pageSize,
			offset,
		)
		if err != nil {
			log.Printf("Error fetching device groups: %+v", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   err.Error(),
				"message": "Failed to query device groups",
			})
			return
		}
		defer func() {
			err := rows.Close()
			if err != nil {
				log.Printf("Error closing rows: %+v", err)
			}
		}()

		var groups []gin.H
		for rows.Next() {
			var id int
			var name string
			var city string
			var weatherWidgetId *string
			if err := rows.Scan(&id, &name, &city, &weatherWidgetId); err != nil {
				log.Printf("Error scanning device group: %+v", err)
				c.JSON(http.StatusInternalServerError, gin.H{
					"error":   err.Error(),
					"message": "Failed to scan device group",
				})
				return
			}
			groups = append(groups, gin.H{
				"id":              id,
				"name":            name,
				"city":            city,
				"weatherWidgetId": weatherWidgetId,
			})
		}

		var count int64
		countRows, err := db.Query(
			`SELECT COUNT(*) FROM device_groups`,
		)
		if err != nil {
			log.Printf("Error counting device groups: %+v", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   err.Error(),
				"message": "Failed to count device groups",
			})
			return
		}
		defer func() {
			err := countRows.Close()
			if err != nil {
				log.Printf("Error closing rows: %+v", err)
			}
		}()

		for countRows.Next() {
			if err := countRows.Scan(&count); err != nil {
				log.Printf("Error scanning device group count: %+v", err)
				c.JSON(http.StatusInternalServerError, gin.H{
					"error":   err.Error(),
					"message": "Failed to scan device group count",
				})
				return
			}
		}
		if groups == nil {
			groups = []gin.H{}
		}

		c.JSON(http.StatusOK, gin.H{
			"deviceGroups": groups,
			"totalCount":   count,
		})
	}
}

func createDeviceGroup(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input CreateDeviceGroupInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}
		_, err := db.Exec(`
        INSERT INTO device_groups (user_id, name, city, weather_widget_id)
        VALUES (?, ?, ?, ?)`,
			1, // TODO: Replace with actual user ID from context or request
			input.Name,
			input.City,
			input.WeatherWidgetId,
		)
		if err != nil {
			log.Printf("Error creating device group: %+v", err)
			c.JSON(500, gin.H{
				"error":   err.Error(),
				"message": "failed to create device group",
			})
			return
		}

		c.JSON(201, gin.H{})
	}
}

func listDevices(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		pageNumber := getOptionalIntParam(c, "pageNumber", 1)
		pageSize := getOptionalIntParam(c, "pageSize", 10)
		offset := (pageNumber - 1) * pageSize
		groupIdStr := c.Param("groupId")
		groupId, err := strconv.Atoi(groupIdStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid group ID"})
			return
		}

		rows, err := db.Query(`SELECT id, serial_number 
FROM devices
WHERE device_group_id = ?
ORDER BY id
LIMIT ?
OFFSET ?`,
			groupId,
			pageSize,
			offset,
		)
		if err != nil {
			log.Printf("Error fetching devices: %+v", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   err.Error(),
				"message": "Failed to query devices",
			})
			return
		}
		defer func() {
			err := rows.Close()
			if err != nil {
				log.Printf("Error closing rows: %+v", err)
			}
		}()

		var devices []gin.H
		for rows.Next() {
			var id int64
			var serialNumber string
			if err := rows.Scan(&id, &serialNumber); err != nil {
				log.Printf("Error scanning device: %+v", err)
				c.JSON(http.StatusInternalServerError, gin.H{
					"error":   err.Error(),
					"message": "Failed to scan device",
				})
				return
			}
			devices = append(devices, gin.H{"id": id, "serialNumber": serialNumber})
		}

		var count int64
		countRows, err := db.Query(`SELECT COUNT(*) FROM devices WHERE device_group_id = ?`, groupId)
		if err != nil {
			log.Printf("Error counting devices: %+v", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   err.Error(),
				"message": "Failed to count devices",
			})
			return
		}
		defer func() {
			err := countRows.Close()
			if err != nil {
				log.Printf("Error closing rows: %+v", err)
			}
		}()
		for countRows.Next() {
			if err = countRows.Scan(&count); err != nil {
				log.Printf("Error scanning device count: %+v", err)
				c.JSON(http.StatusInternalServerError, gin.H{
					"error":   err.Error(),
					"message": "Failed to scan device count",
				})
				return
			}
		}

		if devices == nil {
			devices = []gin.H{}
		}

		c.JSON(http.StatusOK, gin.H{
			"devices":    devices,
			"totalCount": count,
		})
	}
}

func getOptionalIntParam(c *gin.Context, paramName string, defaultValue int) int {
	paramValue := c.Query(paramName)
	if paramValue == "" {
		return defaultValue
	}
	value, err := strconv.Atoi(paramValue)
	if err != nil {
		return defaultValue
	}
	return value
}
