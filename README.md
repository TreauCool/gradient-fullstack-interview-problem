# Gradient Fullstack Interview Problem

This repository contains a toy environment setup with some problems to
work on during a fullstack interview. There is a frontend and a choice
of one of two backends - Python or Go. The candidate will choose _one_
backend to work on. They are not expected to work on both backends.

During the interview, the candidate can use online or AI resources to
look up function syntax, libraries, or framework usage, but is expected
to provide and explain the logic for all problem solutions themselves.

Prior to the interview, the candidate should ensure that they can run
the stack of their choice. The work involved to do so is minimal, the
candidate only needs to install docker and docker-compose, then run
`docker-compose up` on one of the stacks (see [Setup](#Setup)).

## Setup

Before being able to run the stack here, you will need to have docker
and docker-compose installed. See [this
page](https://medium.com/@piyushkashyap045/comprehensive-guide-installing-docker-and-docker-compose-on-windows-linux-and-macos-a022cf82ac0b)
for instructions on installing docker on Windows, Mac, and Linux.

## Running the stack

1. *Python Backend:*

```shell
docker-compose -f docker-compose-python-backend.yml up
```

2. *Go Backend:*

```shell
docker-compose -f docker-compose-go-backend.yml up
```

You should be able to view the frontend at
[http://localhost:3000](http://localhost:3000)

## Data Model

This project uses a simple data model that allows users to create groups
of devices. There are three entities: users, device groups, and devices.
Users have many device groups and device groups have many devices.

```

+------+     +---------------+     +---------+
| user | --> | device groups | --> | devices |
+------+     +---------------+     +---------+

```

See [./seed.sql](./seed.sql) for the database schema

## API Endpoints

* `POST /login` - login - needs to be implemented

  Request Format:

  ```
  {
    "username": string,
    "password": string
  }
  ```

* `GET /device-groups` - fetch device groups

  Query Parameters:
  ```
  pageNumber: page number to retrieve. Defaults to 1
  pageSize: page size. Defaults to 10
  ```

  Response Format:

  ```
  {
    "deviceGroups": [
      {
        "id": int,
        "name": string,
        "city": string,
        "weatherWidgetId": string
      },
      ...
    ],
    "totalCount": int
  }
  ```

* `POST /device-groups` - create a device group

  Request Format:

  ```
  {
    "name": string,
    "city": string,
    "weatherWidgetId": string|null
  }
  ```

* `GET /device-groups/<device_group_id>/devices` - fetch devices in a
  device group

  Query Parameters:
  ```
  pageNumber: page number to retrieve. Defaults to 1
  pageSize: page size. Defaults to 10
  ```

  Response Format:

  ```
  {
    "devices": [
      {
        "id": int,
        "serialNumber": string
      },
      ...
    ],
    "totalCount": int
  }
  ```

## Frontend pages

1. [/device-groups](http://localhost:3000/device-groups) View the user's
   device groups

2. [/create-device-group](http://localhost:3000/create-device-group)
   Create a new device group

3. [/devices](http://localhost:3000/devices?groupId=1) View the list of
   devices in a group

3. [/login](http://localhost:3000/login) Frontend for logging in

## List of Problems To Work On

The problems are listed in relative order of difficulty.


1. [Frontend] Not seeing all devices in a group and seeing incorrect
   count
    1. On the device list page, why is the count of devices incorrect?
    2. On the device list page, why are we not seeing all devices in the
group?

2. [Backend] Implement an endpoint to add a device
    1. add a POST endpoint that takes a device group id and a serial
number and adds a device record matching that.


4. [Frontend] Render list of city options from the weather provider
    1. In the [create-device-group
page](./frontend/src/app/create-device-group/Page.jsx), present the user
with a list of options returned by the weather provider and set the
`weaterWidgetId` and `city` based off of the selected option.

5. [Backend + Frontend] Login + Authentication
    1. Implement the login endpoint to check against username and password
    2. How will the backend know that the user is authenticated?
    3. Why is the list of device groups on the frontend showing all
       device groups?
    4. On the frontend, check if the user is currently authenticated, if
not, redirect to login page

6. What other problems are there in the codebase?
