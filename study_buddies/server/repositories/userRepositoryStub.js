class UserRepositoryStub {
  constructor() {
    this.users = [];
    this.nextId = 1;
  }

  async getAllUsers() {
    return this.users;
  }

  async getUserById(id) {
    return this.users.find((user) => user.id === parseInt(id));
  }

  async createUser(userData) {
    const user = { id: this.nextId++, ...userData, createdAt: new Date() };
    this.users.push(user);
    return user;
  }

  async updateUser(id, updateData) {
    const index = this.users.findIndex((user) => user.id === parseInt(id));
    if (index === -1) return null;
    this.users[index] = { ...this.users[index], ...updateData };
    return this.users[index];
  }

  async deleteUser(id) {
    const index = this.users.findIndex((user) => user.id === parseInt(id));
    if (index === -1) return null;
    const deletedUser = this.users.splice(index, 1);
    return deletedUser[0];
  }
}

const userRepositoryStub = new UserRepositoryStub();

// Export each method as a named export
export const getAllUsers =
  userRepositoryStub.getAllUsers.bind(userRepositoryStub);
export const getUserById =
  userRepositoryStub.getUserById.bind(userRepositoryStub);
export const createUser =
  userRepositoryStub.createUser.bind(userRepositoryStub);
export const updateUser =
  userRepositoryStub.updateUser.bind(userRepositoryStub);
export const deleteUser =
  userRepositoryStub.deleteUser.bind(userRepositoryStub);
