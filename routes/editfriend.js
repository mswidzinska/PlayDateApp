const express = require("express")
const app = express()
const Child = require("../models/Child")
const Caretaker = require("../models/Caretaker")
const cloudinary = require('cloudinary');

app.get("/editfriend/:id", (req, res) => {
    Child.findById(req.params.id)
        .then((friend) => {

            let weekDays = {
                monday: false,
                tuesday: false,
                wednesday: false,
                thursday: false,
                friday: false,
                saturday: false,
                sunday: false
            }

            if (friend.availabledays) {
                friend.availabledays.forEach((weekDay) => {
                    weekDays[weekDay] = true;
                })
            }

            let friendCopy = {...friend._doc };
            friendCopy.availabledays = weekDays;
            friendCopy.id = friend.id;

            res.render("friends/editfriend.hbs", {
                friend: friendCopy
            })

        })
        .catch(err => console.log(err))
})


app.post("/editfriend/:id", (req, res) => {
    debugger
    let childId = req.params.id
    let updatedChild = {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        birthday: req.body.birthday,
        address: req.body.address,
        availabledays: req.body.availabledays || [],
        foodlikes: req.body.foodlikes.split(","),
        fooddislikes: req.body.fooddislikes.split(","),
        allergies: req.body.allergies.split(","),
        activitylikes: req.body.activitylikes.split(","),
        activitydislikes: req.body.activitydislikes.split(",")
    }

    Child.findByIdAndUpdate(childId, updatedChild, { new: true })
        .then((newChild) => {
            res.redirect(`/friends/${newChild.id}`)
        })
        .catch(err => console.log(err))
});

app.get("/deletefriend/:id", (req, res) => {
        Child.findById(req.params.id)
        .then((child) => {
            var promises = [];
            promises.push(cloudinary.uploader.destroy(child.profile_pic));
         for (i = 0; i < child.caretaker.length; i++){
             promises.push(Caretaker.findByIdAndDelete(child.caretaker[i]));
         }
         Promise.all(promises);
        })
        .then(() => Child.findByIdAndDelete(req.params.id)
        )
        .then(() => res.redirect(`/friends`)
        )
        .catch(err => console.log(err));
    });

app.get("/deletecaretaker/:id", (req, res) => {
    Caretaker.findByIdAndRemove(req.params.id)
        .then(() => {
            res.redirect(`/friends/${req.session.childID}`);
        })
        .catch(err => console.log(err));
});

module.exports = app;