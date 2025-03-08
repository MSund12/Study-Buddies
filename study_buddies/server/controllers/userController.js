// import {
//   getAllUsers,
//   getUserById,
//   createUser,
// } from "../repositories/userRepositoryStub.js";

// Controller functions that utilize the injected repository
export const getAllUsers = async (req, res) => {
  try {
    const users = await req.userRepository.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await req.userRepository.getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

export const createUser = async (req, res) => {
  try {
    const newUser = await req.userRepository.createUser(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const updatedUser = await req.userRepository.updateUser(
      req.params.id,
      req.body
    );
    if (!updatedUser) return res.status(404).json({ error: "User not found" });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const deletedUser = await req.userRepository.deleteUser(req.params.id);
    if (!deletedUser) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted", user: deletedUser });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};
