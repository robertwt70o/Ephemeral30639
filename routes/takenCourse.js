const express = require('express')
var mysql = require('mysql')
const router = express.Router()
const authMethods = require('../middleware/auth')
const checkAuthenticated = authMethods.checkAuthenticated
const checkNotAuthenticated = authMethods.checkNotAuthenticated

//Allow Access-Control-Allow-Origin
//ref: https://stackoverflow.com/questions/18642828/origin-origin-is-not-allowed-by-access-control-allow-origin
router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

//Database Connect using pool
//ref: https://stackoverflow.com/questions/14087924/cannot-enqueue-handshake-after-invoking-quit
const pool = mysql.createPool({
    host: "egci492db.cnif8x09ijrk.us-west-2.rds.amazonaws.com",
    user: "egci492dev",
    password: "egci492db4seniorproject",
    database: "egcicourse"
})

const options = { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' }

//load major category structure
router.get('/loadmajorcategorystructure', checkAuthenticated, (req, res) =>{
  pool.getConnection(function(err, connection) {
    connection.query(`(SELECT MainCategory_structure.name FROM MainCategory_structure WHERE ${req.user.studentID.substring(0,2)} BETWEEN MainCategory_structure.start_year AND MainCategory_structure.end_year)`, (err, majorCategory) => {
      if (err){
        console.log(err)
        res.send('Error')
        connection.release()
        return
      };
      const time = new Date(Date.now())
      const timestamp = `${time.toLocaleDateString('en-US', options).substring(5)} ${time.toLocaleTimeString('en-US', {hour12: false})}`
      console.log(`${timestamp}: sending all taken courses`)
      res.send(majorCategory) 
      connection.release(); 
    })
  })
})

//load sub category structure
router.get('/loadsubcategorystructure', checkAuthenticated, (req, res) =>{
  pool.getConnection(function(err, connection) {
    connection.query(`(SELECT SubCategory_structure.name, SubCategory_structure.mainCategory, SubCategory_structure.totalcredit, SubCategory_structure.totalCreditAdvance, SubCategory_structure.groupbyremark FROM SubCategory_structure WHERE ${req.user.studentID.substring(0,2)} BETWEEN SubCategory_structure.start_year AND SubCategory_structure.end_year)`, (err, subCategory) => {
      if (err){
        console.log(err)
        res.send('Error')
        connection.release()
        return
      };
      const time = new Date(Date.now())
      const timestamp = `${time.toLocaleDateString('en-US', options).substring(5)} ${time.toLocaleTimeString('en-US', {hour12: false})}`
      console.log(`${timestamp}: sending all taken courses`)
      res.send(subCategory) 
      connection.release(); 
    })
  })
})

//load all taken courses
router.get('/loadtakencourse', checkAuthenticated, (req, res) =>{
    pool.getConnection(function(err, connection) {
      connection.query(`(SELECT ${req.user.studentID.substring(0,2)}Courses.ID, ${req.user.studentID.substring(0,2)}Courses.Name, ${req.user.studentID.substring(0,2)}Courses.Category, ${req.user.studentID.substring(0,2)}Courses.Credit, ${req.user.studentID}_Taken_Courses.remark FROM ${req.user.studentID}_Taken_Courses INNER JOIN ${req.user.studentID.substring(0,2)}Courses ON ${req.user.studentID}_Taken_Courses.Course_ID=${req.user.studentID.substring(0,2)}Courses.ID)`, (err, takenCourses) => {
        if (err){
          console.log(err)
          res.send('Error')
          connection.release()
          return
        };
        const time = new Date(Date.now())
        const timestamp = `${time.toLocaleDateString('en-US', options).substring(5)} ${time.toLocaleTimeString('en-US', {hour12: false})}`
        console.log(`${timestamp}: sending all taken courses`)
        res.send(takenCourses) 
        connection.release(); 
      })
    })
})

//load all non taken courses
router.get('/loadnontakencourse', checkAuthenticated, (req, res) =>{
  pool.getConnection(function(err, connection) {
    connection.query(`SELECT ${req.user.studentID.substring(0,2)}Courses.ID, ${req.user.studentID.substring(0,2)}Courses.Name, ${req.user.studentID.substring(0,2)}Courses.Category, ${req.user.studentID.substring(0,2)}Courses.Credit FROM ${req.user.studentID.substring(0,2)}Courses WHERE ${req.user.studentID.substring(0,2)}Courses.ID NOT IN (SELECT ${req.user.studentID}_Taken_Courses.Course_ID FROM ${req.user.studentID}_Taken_Courses)`, (err, Courses) => {
      if (err){
        console.log(err)
        res.send('Error')
        connection.release()
        return
      };
      const time = new Date(Date.now())
      const timestamp = `${time.toLocaleDateString('en-US', options).substring(5)} ${time.toLocaleTimeString('en-US', {hour12: false})}`
      console.log(`${timestamp}: sending all non taken courses`)
      res.send(Courses) 
      connection.release(); 
    })
  })
})

//add taken course
router.post('/addtakencourse', checkAuthenticated, (req, res) =>{
  for (var i = 0; i < req.body.length; i++)  
      addCourse(req.body[i].ID, req.user.studentID, req.body[i].remark)
  res.send("add success") 
})

//delete taken course
router.post('/deletetakencourse', checkAuthenticated, (req, res) =>{
  for (var i = 0; i < req.body.length; i++)  
    deleteCourse(req.body[i].ID, req.user.studentID)
  res.send("delete success") 
})

function addCourse(courseID, studentID, remark){
  pool.getConnection(function(err, connection) {
    connection.query(`INSERT INTO ${studentID}_Taken_Courses (Student_ID, Course_ID, remark) VALUES ('${studentID}', '${courseID}', '${remark}')`, (err) => {
      if (err){
        console.log(err.sqlMessage)
        res.send(err.sqlMessage)
        return
      }
      else{
        connection.query(`INSERT INTO Taken_Courses (Student_ID, Course_ID) VALUES ('${studentID}', '${courseID}')`, (err) => {
          if (err){
            console.log(err.sqlMessage)
            res.send(err.sqlMessage)
            return
          } 
          console.log("Added " + studentID + ", " + courseID + " to Taken_Courses table")
        })
        console.log("Added "  + courseID + " to " + studentID + "'s taken course table");
      }
      connection.release(); 
    })
  })
}

function deleteCourse(courseID, studentID){
  pool.getConnection(function(err, connection) {
    connection.query(`DELETE FROM ${studentID}_Taken_Courses where Course_ID like '${courseID}'`, (err) => {
      if (err){
        console.log(err.sqlMessage)
        res.send(err.sqlMessage)
        return
      }
      else{
        connection.query(`DELETE FROM Taken_Courses where Student_ID like '${studentID}' and Course_ID like '${courseID}'`, (err) => {
          if (err){
            console.log(err.sqlMessage)
            res.send(err.sqlMessage)
            return
          } 
          console.log("Deleted " + studentID + ", " + courseID + " from Taken_Courses table")
        })
        console.log("Deleted "  + courseID + " from " + studentID + "'s taken course table");
      }
      connection.release(); 
    })
  })
}

module.exports = router