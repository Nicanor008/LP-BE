const Todo = require("./todo_model");
const mongoose = require("mongoose");

exports.createTodo = (req, res) => {
  let {
    name,
    startTime,
    endTime,
    duration,
    category,
    completed,
    user,
    durationInteger,
    tags,
  } = req.body;
  if (name === "") {
    return res.status(404).json({ message: "Todo item name is required" });
  }

  // if the same todo name exists, don't add to db
  Todo.find({ name, archived: false, completed: false }).then((resp) => {
    resp.map((duplicate) => {
      if (duplicate.user.toString() === user) {
        return res.status(409).json({
          message: "Todo Item name already exists, be sure to change",
        });
      }
    });
    tags = tags.toLowerCase()
    tags = tags.charAt(0).toUpperCase().concat(tags.slice(1))
    const todo = new Todo({
      name,
      startTime,
      endTime,
      duration,
      user: mongoose.Types.ObjectId(user),
      category,
      completed,
      tags,
      durationInteger,
      category: "todo",
    });
    todo
      .save()
      .then((todoItem) => {
        return res
          .status(200)
          .json({ message: "Todo Item created", data: todoItem });
      })
      .catch((error) => {
        return res.status(500).json({
          message: "Something went wrong, Try again",
          error,
        });
      });
  });
};

// get all todo items
// not considering the user
exports.fetchAllTodoItems = (req, res) => {
  Todo.find({ archived: false })
    .sort({ updatedAt: -1 })
    .then((todos) => {
      if (todos.length === 0) {
        res.status(404).json({ message: "No Todo items" });
      }
      res.status(200).json({ message: "All Todo Items", data: todos });
    });
};

// fetch user todos
exports.fetchUserTodos = (req, res) => {
  const { user } = req.session;
  Todo.find({ user, archived: false })
    .sort({ updatedAt: -1 })
    .then((userTodos) => {
      if (userTodos.length === 0) {
        return res
          .status(404)
          .json({ message: "You don't have any todo items" });
      }
      return res
        .status(200)
        .json({ message: "Your all todo items", data: userTodos });
    });
};

function groupBy(list, sortBy24hours, keyGetter) {
  const map = new Map();
  list.forEach((item) => {
    const timeDifference = (new Date(item.updatedAt).valueOf() - new Date().valueOf()) / 1000 / 60 / 60;
    if (sortBy24hours && timeDifference >= -24) {
      const key = keyGetter(item);
      const collection = map.get(key);
      if (!collection) {
        map.set(key, [item]);
      } else {
        collection.push(item);
      }
    } else if (!sortBy24hours) {
      const key = keyGetter(item);
      const collection = map.get(key);
      if (!collection) {
        map.set(key, [item]);
      } else {
        collection.push(item);
      }
    }
  });
  return map;
}

// list uncompleted todos
exports.fetchUnCompletedTodos = (req, res) => {
  Todo.find({ completed: false, archived: false, user: req.id })
    .sort({ updatedAt: -1 })
    .then((unCompletedTodos) => {
      if (unCompletedTodos.length === 0) {
        return res
          .status(404)
          .json({ message: "You don't have any todo items" });
      }
      const grouped = groupBy(unCompletedTodos, false, (tags) => tags.tags);
      return res.status(200).json({
        message: `${unCompletedTodos.length} Ongoing Todo`,
        data: unCompletedTodos,
        groupedByKeywords: [...grouped],
      });
    });
};

// update todo item to finished
exports.updateUnCompletedTodos = (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;
  if (completed === "" || completed === null || completed === undefined) {
    return res.status(404).json({ message: "Completed status is required" });
  }
  Todo.findByIdAndUpdate({ _id: id }, { completed: !completed }).then(() => {
    Todo.findById({ _id: id }).then((data) => {
      return res.status(200).json({ message: "Todo item updated", data });
    });
  });
};

// list completed todos
exports.fetchCompletedTodos = (req, res) => {
  Todo.find({ completed: true, archived: false, user: req.id })
    .sort({ updatedAt: -1 })
    .then((completedTodos) => {
      if (completedTodos.length === 0) {
        return res
          .status(404)
          .json({ message: "You don't have any todo items" });
      }
      const grouped = groupBy(completedTodos, true, (tags) => tags.tags);
      return res.status(200).json({
        message: `${completedTodos.length} Todo done`,
        data: completedTodos,
        groupedByKeywords: [...grouped],
      });
    });
};

// soft delete todo items items
// archive todo
exports.archivedTodo = (req, res) => {
  const { archived } = req.body;
  Todo.findOneAndUpdate({ _id: req.params._id }, { archived: !archived }).then(
    (archivedTodo) => {
      if (!archivedTodo) {
        return res.status(404).json({ message: "Todo item doesn't exists" });
      }
      return res
        .status(200)
        .json({ message: "Todo has been archived", data: archivedTodo });
    }
  );
};

// fetch all archived data
exports.fetchedArchivedTodo = (req, res) => {
  Todo.aggregate([
    { $match: { archived: true, user: req.session.user } },
    {
      $sort: {
        updatedAt: -1,
      },
    },
  ]).then((allArchivedTodo) => {
    if (allArchivedTodo.length === 0) {
      return res.status(404).json({ message: "No archived todo items" });
    }
    return res
      .status(200)
      .json({ message: "Archived todo items", data: allArchivedTodo });
  });
};

// delete(hard) todo item
exports.deleteTodoItem = (req, res) => {
  const { _id } = req.params;
  Todo.findByIdAndDelete({ _id }).then((deletedTodo) => {
    if (!deletedTodo) {
      return res.status(404).json({ message: "Todo item does not exist" });
    }
    return res.status(200).json({ message: "Todo item deleted" });
  });
};

exports.deleteAllUserTodoItems = (req, res) => {
  Todo.deleteMany({ user: req.session.user }).then((userTodoItems) => {
    if (userTodoItems.deletedCount === 0) {
      return res.status(404).json({ message: "You don't have any todo items" });
    }
    return res
      .status(200)
      .json({ message: `${userTodoItems.deletedCount} todo items deleted` });
  });
};

// fetch single todo item

exports.getSingleTodo = (req, res) => {
  const { _id } = req.params;
  Todo.findOne({ _id }).then((singleTodo) => {
    if (singleTodo === null) {
      return res.status(404).json({ message: "Todo item not available" });
    }
    return res.status(200).json({ message: "Todo item", data: singleTodo });
  });
};
// update single todo item body
exports.updateSingleTodo = (req, res) => {
  const { _id } = req.params;
  Todo.findByIdAndUpdate({ _id }, req.body).then((updatedItem) => {
    if (!updatedItem) {
      return res.status(404).json({ message: "Todo item not available" });
    }
    Todo.findOne({ _id }).then((data) => {
      return res.status(200).json({ message: "Todo updated", data });
    });
  });
};

// search todo by name
exports.searchTodoItemByName = (req, res) => {
  const { name } = req.params;
  Todo.find({ name: { $regex: name } }).then((data) => {
    if (!data.length) {
      return res.status(200).json({ message: `No todo with ${name} found` });
    }
    return res.status(200).json({ message: `${data.length} todo found`, data });
  });
};

// list todo by tags
exports.listTodoByTags = (req, res) => {
  const { tag } = req.params;
  Todo.find({ tags: { $regex: tag } })
    .sort({ updatedAt: -1 })
    .then((data) => {
      if (!data.length) {
        return res
          .status(200)
          .json({ message: `No todo with  tag ${tag} found` });
      }
      return res
        .status(200)
        .json({ message: `${data.length} todo with tag ${tag}`, data });
    });
};

// fetch all todo and group into relevant tags
// exports.groupTodoByTags = (req, res) => {
//   Todo.find({ user: req.id })
//     .sort({ updatedAt: -1 })
//     .then((data) => {
//       if (!data.length) {
//         return res
//           .status(200)
//           .json({ message: `No todo with  tag ${tag} found` });
//       }
//       return res
//         .status(200)
//         .json({ message: `${data.length} todo with tag ${tag}`, data });
//     });
// };
