# Pooler
CS546-B Final Project: Aids to help groups of people car pool together when going to events

## Team Members
* Jordan Wang, 10452069
* Johnny Wong, 10446964
* Sophia Zuo, 10448401
* Nicholas Soriano, 10452063
* Roland Tumbokon, 10450954

## Introduction
This website acts as a more intuitive and user friendly way to organize car trips to destinations. We expedite the car pooling process through our application by letting the user view what trips are happening and when. When they click on these trips, they will be able to see who is able to drive and who currently has seats in their car, along with all the cars going on this trip. The user will be able to sign in and add themselves to cars, or add their own cars and view various information about the drivers.

Currently, most clubs use Google Sheets or Excel documents to handle carpooling, and we hope to replace this and streamline the carpooling process. The purpose of this application is to help organize carpooling amongst organizations and groups of people and provide more useful information during these trips.

## How to Run
1. Clone the repo
2. Run `npm install` to install relevant packages
3. Run `npm run seed` to seed the database
4. Go to localhost:3000
5. Create an account and explore the pre-seeded events on our Pooler website!

## Core Features
1. **Landing Page**: This explains the purpose and functionality of the Pooler website
2. **User Profile:** Upon account creation a user’s profile will be automatically created. User profile will include important information about the user such as name, home address, venmo username, contact information, and if they are a driver and/or a passenger.
3. **Edit Profile Information**: Users should be able to change their name, password, and various information about their profile.
4. **Creating/Updating/Deleting an Event**: Users can create events with various event details and update/delete them as needed.
5. **Comments:** Allow users to communicate with other users in the same pool.
6. **Create/Update/Delete a Pool**: Users with a car can create a pool in events they are attending/invited to and update/delete information as needed. 
7. **Individual Pool Page:** Shows all the information for the car pool such as car capacity, users, destination, and departure time.
8. **History Page**: Shows all current and past events the user has participated in and what carpool you were a part of.
9. **Sort Events on History Page**: Sort upcoming events by time (ascending or descending).
10.  **Search for Events**: Allow the users to search for events by keyword and be able to join them