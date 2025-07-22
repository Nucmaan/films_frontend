import axios from "axios";

 export async function getSubtasksWithAssignments(taskService, id) {
  if (!id) return [];
   const res = await axios.get(`${taskService}/api/subtasks/task/${id}`);
  const subtasks = Array.isArray(res.data) ? res.data : [];

   let assignments = {};
  try {
    const checkEndpoint = await axios.head(`${taskService}/api/task-assignment/latestAssignments/${id}`);
    if (checkEndpoint.status === 200) {
      const assignmentsResponse = await axios.get(`${taskService}/api/task-assignment/latestAssignments/${id}`);
      assignments = assignmentsResponse.data?.assignments || {};
    }
  } catch (e) {
  }

  return subtasks.map((item) => {
    const assignment = assignments[item.id];
    return {
      ...item,
      file_url: (() => {
        if (!item.file_url) return [];
        if (typeof item.file_url === "string") {
          if (item.file_url.trim().startsWith("[")) {
            try { return JSON.parse(item.file_url); } catch { return [item.file_url]; }
          } else { return [item.file_url]; }
        }
        return Array.isArray(item.file_url) ? item.file_url : [item.file_url];
      })(),
      assigned_to: assignment?.updated_by || item.assigned_to || 0,
      assigned_user: assignment?.assigned_user || item.assigned_user || null,
      profile_image: assignment?.profile_image || item.profile_image || null,
    };
  });
}

 export async function getUsers(userService) {
  const res = await axios.get(`${userService}/api/auth/users`);
  const users = res.data.users || res.data;
  return Array.isArray(users)
    ? users.filter((u) => u.role !== "Admin" && u.role !== "Supervisor")
    : [];
}

 export async function createSubtask(taskService, data) {
   const res = await axios.post(`${taskService}/api/subtasks/create`, data.formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

 export async function updateSubtask(taskService, subtaskId, subtaskData) {
  const res = await axios.put(`${taskService}/api/subtasks/updateSubTask/${subtaskId}`, subtaskData);
  return res.data;
}

 export async function deleteSubtask(taskService, subtaskId) {
  const res = await axios.delete(`${taskService}/api/subtasks/DeleteSubTask/${subtaskId}`);
  return res.data;
}

 export async function assignSubtask(taskService, subtaskId, userId, assignedby_id) {
  const res = await axios.post(`${taskService}/api/task-assignment/assignTask`, {
    task_id: subtaskId,
    user_id: userId,
    assignedby_id,
  });
  return res.data;
}
