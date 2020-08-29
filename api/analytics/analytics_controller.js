const Todo = require("../todo/todo_model");
const mongoose = require("mongoose");
const moment = require("moment");

function get24hoursData(data) {
  const durationLastUpdated = moment(data.updatedAt, "YYYYMMDDhhmm").fromNow();
  if (
    durationLastUpdated.indexOf("hour") > 1 ||
    durationLastUpdated.indexOf("minute") > 1
  ) {
    return true;
  }
  return false;
}

exports.getAnalytics = (req, res) => {
  Todo.find({ user: mongoose.Types.ObjectId(req.id) })
    .then(async (data) => {
      if (data.length === 0) {
        return res.status(404).json({
          error: "no data available",
        });
      }
      let totalTodo = [];
      let todoCompletedItems = [];
      let todoUnCompletedItems = [];
      let todoCompleteDuration = 0;
      let todoUnCompleteDuration = 0;
      let tempTodoCompleteDuration = [];
      let tempTodoUnCompleteDuration = [];
      let todoArchivedItems = [];
      let todoUnArchivedItems = [];
      let dailyArchivedTodo = [];

      data.filter((filteredData) => {
        if (filteredData.category === "todo") {
          totalTodo.push(filteredData);
          if (filteredData.archived) {
            todoArchivedItems.push(filteredData);
            if (get24hoursData(filteredData)) {
              dailyArchivedTodo.push(filteredData);
            }
          } else {
            if (get24hoursData(filteredData)) {
              todoUnArchivedItems.push(filteredData);
            }
          }
          if (filteredData.completed && !filteredData.archived) { //ongoing
            if (get24hoursData(filteredData)) { // active in 24 hours
              todoCompletedItems.push(filteredData);
            }
            if (filteredData.durationInteger) {
              tempTodoCompleteDuration.push(filteredData.durationInteger);
            }
          } else if (!filteredData.completed && !filteredData.archived) { // completed
            if (get24hoursData(filteredData)) { // active in 24 hours
              todoUnCompletedItems.push(filteredData);
            }
            if (filteredData.durationInteger) {
              tempTodoUnCompleteDuration.push(filteredData.durationInteger);
            }
          }
        }
        todoCompleteDuration =
          tempTodoCompleteDuration.length > 0
            ? tempTodoCompleteDuration.reduce((a, b) => a + b)
            : 0;
        todoUnCompleteDuration =
          tempTodoUnCompleteDuration.length > 0
            ? tempTodoUnCompleteDuration.reduce((a, b) => a + b)
            : 0;
      });

      return res.status(200).json({
        message: "Awesome, here is your Analytics data",
        totalItems: data.length,
        todo: {
          totalTodo: totalTodo.length,
          totalCompletedTodo: todoCompletedItems.length,
          totalCompleteTodoDuration: todoCompleteDuration,
          todoUnCompleteTodoDuration: todoUnCompleteDuration,
          totalUncompletedTodo: todoUnCompletedItems.length,
          totalArchived: todoArchivedItems.length,
          dailyArchived: dailyArchivedTodo.length,
          todoActive: todoCompletedItems.length + todoUnCompletedItems.length,
          data: totalTodo,
          complete: todoCompletedItems,
          ongoing: todoUnCompletedItems,
        },
      });
    })
    .catch(() => {
      res.status(500).json({
        message: "Something went wrong. Try again.",
      });
    });
};
