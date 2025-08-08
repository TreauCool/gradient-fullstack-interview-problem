from flask import Flask, jsonify, request
import os
import mysql.connector
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})


def connect_to_db():
    return mysql.connector.connect(
        host=os.environ['DB_HOST'],
        user=os.environ['DB_USER'],
        password=os.environ['DB_PASSWORD'],
        database=os.environ['DB_NAME']
    )


@app.route('/login', methods=['POST'])
def login():
    # TODO: implement this
    return jsonify({})


@app.route('/device-groups', methods=['GET'])
def list_device_groups():
    page_number = int(request.args.get('pageNumber', 1))
    page_size = int(request.args.get('pageSize', 10))
    with connect_to_db() as conn:
        with conn.cursor(dictionary=True) as cursor:
            offset = (page_number - 1) * page_size
            cursor.execute(
                "SELECT * FROM device_groups ORDER BY id LIMIT %s OFFSET %s",
                (page_size, offset)
            )
            page = [
                {
                    "id": row["id"],
                    "name": row["name"],
                    "city": row["city"],
                    "weatherWidgetId": row["weather_widget_id"],
                }
                for row in cursor.fetchall()
            ]
            cursor.execute("SELECT COUNT(*) AS cnt FROM device_groups")
            total_count = cursor.fetchone()["cnt"]
            return jsonify({
                "deviceGroups": page,
                "totalCount": total_count
            })


@app.route('/device-groups', methods=['POST'])
def create_device_group():
    data = request.get_json()
    name = data['name']
    city = data['city']
    weather_widget_id = data.get('weatherWidgetId')
    with connect_to_db() as conn:
        with conn.cursor(dictionary=True) as cursor:
            cursor.execute(
                "INSERT INTO device_groups (user_id, name, city, weather_widget_id) "
                "VALUES (%s, %s, %s, %s)",
                # TODO: replace 1 with actual user_id from session or auth
                (1, name, city, weather_widget_id)
            )
            conn.commit()
    return jsonify({}, 201)


@app.route('/device-groups/<int:group_id>/devices', methods=['GET'])
def list_devices(group_id):
    page_number = int(request.args.get('pageNumber', 1))
    page_size = int(request.args.get('pageSize', 10))
    with connect_to_db() as conn:
        with conn.cursor(dictionary=True) as cursor:
            offset = (page_number - 1) * page_size
            cursor.execute(
                "SELECT * FROM devices WHERE device_group_id = %s ORDER BY id LIMIT %s OFFSET %s ",
                (group_id, page_size, offset)
            )
            page = [
                {
                    "id": row["id"],
                    "serialNumber": row["serial_number"],
                }
                for row in cursor.fetchall()
            ]
            cursor.execute("SELECT COUNT(*) AS cnt FROM devices WHERE device_group_id = %s", (group_id,))
            total_count = cursor.fetchone()["cnt"]
            return jsonify({
                "devices": page,
                "totalCount": total_count
            })


@app.route('/health', methods=['GET'])
def health():
    try:
        with connect_to_db() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT 1")
                result = cursor.fetchone()
                if result and result[0] == 1:
                    return jsonify({"status": "healthy"}), 200
                else:
                    return jsonify({"status": "unhealthy"}), 500
    except mysql.connector.Error as err:
        return jsonify({"status": "unhealthy", "error": str(err)}), 500


if __name__ == '__main__':
    app.run(
        debug=True,
        host='0.0.0.0',
        port=int(os.environ['APP_PORT'])
    )
