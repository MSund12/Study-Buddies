import User from "../models/User.js";

export default class UserRepository {
  async getAllUsers() {
    return await User.find({});
  }

  async getUserById(id) {
    return await User.findById(id);
  }

  async createUser(userData) {
    const user = new User(userData);
    return await user.save();
  }

  async updateUser(id, updateData) {
    return await User.findByIdAndUpdate(id, updateData, { new: true });
  }

  async deleteUser(id) {
    return await User.findByIdAndDelete(id);
  }
}
