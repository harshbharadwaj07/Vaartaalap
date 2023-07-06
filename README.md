# Vaartalaap

A Full-stack web application built using MERN and Socket.io that creates real-time chatting environment for registered and authorised users on both one-on-one and group chats.
The app provides real-time communication experience for messaging and group operations including new group creation, adding/removing participants by the admin and leaving groups.
The app currently provides the following features:
1. While registration the users can upload their profile pic.
2. Users can search other community users.
3. Using one-on-one chat users can send and receive text messages to/from an individual user.
4. For group chats users can create, leave and rename groups and only group admin adds, removes participants and delete group.
5. The app provides notifications of new messages to users online.
6. The app also provides alerts to users when they are added to new groups, removed from group and when the group is deleted by the admin.

The backend is hosted on Render while frontend could be run by cloning the frontend directory and running following commands:
npm install (to install dependencies)
npm start (to start the frontend)

The data is stored and retrieved from the MongoDB Atlas Cloud.