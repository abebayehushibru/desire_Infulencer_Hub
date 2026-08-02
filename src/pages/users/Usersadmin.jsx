import { useState } from "react";
import UsersListPage from "./Users";
import { UserForm } from "./UserForm";
import useApi from "../../hooks/useApi";

/**
 * Ties the list, create, and edit views together.
 * Swap the local `view` state for your router (react-router, next/navigation, etc.)
 * and the setTimeout calls for real API requests.
 */
function UsersAdmin() {
  const [view, setView] = useState({ name: "list" }); // "list" | "create" | "edit"
  const [saving, setSaving] = useState(false);
const userCreateApi = useApi({
        request: (body) => ({
            method: "POST",
            path: "/users",
            data: body,
        }),
    });
    const userUpdateApi = useApi({
        request: (body) => ({
            method: "PUT",
            path: `/users/${view.user.id}`,
            data: body,
        }),
    });
  function goToList() {
    setView({ name: "list" });
  }

  async function handleCreate(payload) {
    payload.successMsg = "User created successfully!";
    const response = await userCreateApi.execute(payload);
    if (response.success) {
       goToList();
    }
  
  }

 async function handleUpdate(payload) {
  
    const updatedPayload = { ...view.user, ...payload,successMsg:"User updated successfully!" };
    const response = await userUpdateApi.execute(updatedPayload);
    if (response.success) {
        goToList();
    }
   
  }

  if (view.name === "create") {
    return (
      <div className="min-h-full relative  min-w-full">
        <UserForm mode="create" onSubmit={handleCreate} onCancel={goToList} loading={userCreateApi.loading} />
      </div>
    );
  }

  if (view.name === "edit") {
    return (
      <div className="min-h-full ">
        <UserForm
          mode="edit"
          initialData={view.user}
          onSubmit={handleUpdate}
          onCancel={goToList}
          loading={userUpdateApi.loading}
        />
      </div>
    );
  }

  return (
    <UsersListPage
      onCreate={() => setView({ name: "create" })}
      onEdit={(user) => setView({ name: "edit", user })}
      // onView={(user) =>setView({ name: "edit", user })}
    />
  );
}

export default UsersAdmin;