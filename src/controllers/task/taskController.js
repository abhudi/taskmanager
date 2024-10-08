import asyncHandler from "express-async-handler";
import TaskModel from "../../models/auth/tasks/TaskModel.js";

export const createTask = asyncHandler(async (req, res) => {
  try {
    const { title, description, dueDate, priority, status } = req.body;

    if (!title || title.trim() === "") {
      res.status(400).json({ message: "Title is required!" });
    }

    if (!description || description.trim() === "") {
      res.status(400).json({ message: "Description is required!" });
    }

    const task = new TaskModel({
      title,
      description,
      dueDate,
      priority,
      status,
      user: req.user._id, // Ensure this exists
    });

    await task.save();

    return res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export const getTasks = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      res.status(400).json({ message: "User Not found!" });
    }
    const tasks = await TaskModel.find({ user: userId });
    res.status(200).json({
      length: tasks.length,
      tasks,
    });
  } catch (error) {
    console.log("Error in get tasks", error.message);
    res.status(500).json({ message: error.message });
  }
});

export const getTask = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      res.status(400).json({ message: "User Not found!" });
    }

    const { id } = req.params;

    if (!id) {
      res.status(400).json({ message: "please provide task id!" });
    }

    const task = await TaskModel.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found!" });
    }

    if (!task.user.equals(userId)) {
      res.status(401).json({ message: "Not authorized" });
    }

    res.status(200).json(task);
  } catch (error) {
    console.log("Error in get tasks", error.message);
    res.status(500).json({ message: error.message });
  }
});

export const updateTask = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    const { id } = req.params;
    const { title, description, dueDate, priority, status, completed } =
      req.body;

    if (!id) {
      res.status(404).json({ message: "Please Provide a task id" });
    }

    const task = await TaskModel.findById(id);

    if (!task) {
      res.status(404).json({ message: "Task not found!" });
    }

    // check if the user is owner of the task

    if (!task.user.equals(userId)) {
      res.status(401).json({ message: "Not authorized" });
    }
    // update the task
    task.title = title || task.title;
    task.description = description || task.description;
    task.dueDate = dueDate || task.dueDate;
    task.priority = priority || task.priority;
    task.status = status || task.status;
    task.completed = completed || task.completed;

    // Save the updated task
    await task.save();

    // Return the updated task as response
    res.status(200).json({ message: "Task updated successfully", task });
  } catch (error) {
    console.log("Error in update task", error.message);
    res.status(500).json({ message: error.message });
  }
});

export const deleteTask = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const task = await TaskModel.findById(id);

    if (!task) {
      res.status(404).json({ message: "Task Not Found!" });
    }

    if (!task.user.equals(userId)) {
      res.status(401).json({ message: "not authorized to delete task" });
    }

    await TaskModel.findByIdAndDelete(id);
    return res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.log("Error in delete task", error.message);
    res.status(500).json({ message: error.message });
  }
});
