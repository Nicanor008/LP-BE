const Todo = require("../todo/todo_model");
const mongoose =require("mongoose")

exports.getAnalytics = (req, res) => {
  Todo.find({ user: mongoose.Types.ObjectId(req.id) }).then(async (data) => {
    if (data.length === 0) {
      return res.status(404).json({
       error: 'no data available',
      });
    }
    let totalTodo = [];
    let todoCompletedItems = [];
    let todoUnCompletedItems = [];
    let todoCompleteDuration = 0;
    let todoUnCompleteDuration = 0;
    let tempTodoCompleteDuration = [];
    let tempTodoUnCompleteDuration = [];
    let todoArchivedItems = []
    let todoUnArchivedItems = []

    data.filter((filteredData) => {
      if (filteredData.category === "todo") {
        totalTodo.push(filteredData);
        if(filteredData.archived){
          todoArchivedItems.push(filteredData)
        } else {
          todoUnArchivedItems.push(filteredData)
        }
        if (filteredData.completed && !filteredData.archived) {
          todoCompletedItems.push(filteredData)
          if (filteredData.durationInteger) {
            tempTodoCompleteDuration.push(filteredData.durationInteger);
          }
        } else if (!filteredData.completed && !filteredData.archived) {
          todoUnCompletedItems.push(filteredData)
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
        todoActive: todoUnArchivedItems.length,
        data: totalTodo,
        complete: todoCompletedItems,
        ongoing: todoUnCompletedItems
      },
    });
  }).catch(() => {
    res.status(500).json({
      message: "Something went wrong. Try again."
    })
  })
};
