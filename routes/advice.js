const express = require('express')
const router = express.Router()
const passport = require('passport')
const mysql = require('mysql')
const authMethods = require('../middleware/auth')
const methodOverride = require('method-override')
const checkAuthenticated = authMethods.checkAuthenticated
const checkNotAuthenticated = authMethods.checkNotAuthenticated

const pool = mysql.createPool({
    host: "egci492db.cnif8x09ijrk.us-west-2.rds.amazonaws.com",
    user: "egci492dev",
    password: "egci492db4seniorproject",
    database: "egcicourse"
})

const options = { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' }

router.get("/getalladvicecategory", (req, res) => {
  pool.getConnection(function(err, connection) {
      connection.query(`select distinct category from Advices`, (err, data) => {
        if (err){
          console.log(err)
          res.send('Error')
          connection.release()
          return
        };
        connection.release();
        const time = new Date(Date.now())
        const timestamp = `${time.toLocaleDateString('en-US', options).substring(5)} ${time.toLocaleTimeString('en-US', {hour12: false})}`
        console.log(`${timestamp}: sending all advice categories`)
        res.send(data)
      })
  })
})

router.get("/getalladvice", (req, res) => {
    pool.getConnection(function(err, connection) {
        connection.query(`SELECT Advices.category, Advices.courseID, AllCourses.Name, Advices.adviceText FROM Advices INNER JOIN AllCourses ON AllCourses.ID=Advices.courseID`, (err, data) => {
          if (err){
            console.log(err)
            res.send('Error')
            connection.release()
            return
          };
          connection.release();
          const time = new Date(Date.now())
          const timestamp = `${time.toLocaleDateString('en-US', options).substring(5)} ${time.toLocaleTimeString('en-US', {hour12: false})}`
          console.log(`${timestamp}: sending all advices`)
          res.send(data)
        })
    })
})

router.get("/getspecificadvice", (req, res) => {
  pool.getConnection(function(err, connection) {
      connection.query(`SELECT Advices.category, Advices.courseID, AllCourses.Name, Advices.adviceText FROM Advices INNER JOIN AllCourses ON AllCourses.ID=Advices.courseID WHERE courseID like "${req.query.course}"`, (err, data) => {
        if (err){
          console.log(err)
          res.send('Error')
          connection.release()
          return
        };
        connection.release();
        const time = new Date(Date.now())
        const timestamp = `${time.toLocaleDateString('en-US', options).substring(5)} ${time.toLocaleTimeString('en-US', {hour12: false})}`
        console.log(`${timestamp}: sending a specific advice`)
        res.send(data)
      })
  })
})

router.post("/editadvice", (req, res) => {
  pool.getConnection(function(err, connection) {
      connection.query(`UPDATE Advices SET category = "${req.query.category}", courseID = "${req.query.courseID}", adviceText = "${req.query.adviceText}" where courseID like "${req.query.courseID}"`, (err, data) => {
        if (err){
          console.log(err)
          res.send('Error')
          connection.release()
          return
        };
        connection.release();
        const time = new Date(Date.now())
        const timestamp = `${time.toLocaleDateString('en-US', options).substring(5)} ${time.toLocaleTimeString('en-US', {hour12: false})}`
        console.log(`${timestamp}: Successfully edited an advice`)
        res.send('Successfully Edit')
      })
  })
})

router.post("/createadvice", (req, res) => {
  pool.getConnection(function(err, connection) {
      connection.query(`INSERT INTO Advices (category, courseID, adviceText) VALUES ("${req.query.category}","${req.query.courseID}","${req.query.adviceText}")`, (err, data) => {
        if (err){
          console.log(err)
          res.send(err.code)
          connection.release()
          return
        };
        connection.release();
        const time = new Date(Date.now())
        const timestamp = `${time.toLocaleDateString('en-US', options).substring(5)} ${time.toLocaleTimeString('en-US', {hour12: false})}`
        console.log(`${timestamp}: successfully created an advice`)
        res.send('Successfully Created')
      })
  })
})

router.delete("/deleteadvice", (req, res) => {
  pool.getConnection(function(err, connection) {
      connection.query(`DELETE FROM Advices WHERE courseID LIKE '${req.query.courseID}' AND category like '${req.query.category}'`, (err, data) => {
        if (err){
          console.log(err)
          res.send('Error')
          connection.release()
          return
        };
        connection.release();
        const time = new Date(Date.now())
        const timestamp = `${time.toLocaleDateString('en-US', options).substring(5)} ${time.toLocaleTimeString('en-US', {hour12: false})}`
        console.log(`${timestamp}: successfully deleted an advice`)
        res.send('Successfully Delete')
      })
  })
})

module.exports = router