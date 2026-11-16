
import { axiosInstance } from "@/shared/api/axios";

export type CreateUserInput = {
  full_name: string;
  email: string;
  password: string;
  role: string;
};

export type UpdateUserInput = Partial<CreateUserInput>;

class UserService {
  // GET /admin/users/list
  async getUsers() {
    const response = await axiosInstance.get("/admin/users/list");
    return response.data;
  }

  // POST /admin/users
  async createUser(data: CreateUserInput) {
    const response = await axiosInstance.post("/admin/users", data);
    return response.data;
  }

  // POST /admin/users/deactivate
  async deactivateUser(data: Record<string, string>) {
    const response = await axiosInstance.post(
      "/admin/users/deactivate",
      data
    );
    return response.data;
  }

  // POST /admin/users/activate
  async activateUser(data: Record<string, string>) {
    const response = await axiosInstance.post(
      "/admin/users/activate",
      data
    );
    return response.data;
  }

  // POST /admin/users/assign-role
  async assignRole(data: Record<string, string>) {
    const response = await axiosInstance.post(
      "/admin/users/assign-role",
      data
    );
    return response.data;
  }
}

export const userService = new UserService();
