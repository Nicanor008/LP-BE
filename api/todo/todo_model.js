const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const todoSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: "todo"
    },
    tags: String,
    startTime: {
      type: String,
      required: false,
    },
    endTime: {
      type: String,
      required: false,
    },
    duration: {
      type: Number,
      required: false,
      default: 0
    },
    completed: {
      type: Boolean,
      required: true,
      default: false
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    archived: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Todo", todoSchema);
