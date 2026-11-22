import { useEffect, useState } from "react";
import { GoX } from "react-icons/go";
import { FiEdit2, FiPlus } from "react-icons/fi";
import Swal from 'sweetalert2';
import Cookies from 'js-cookie';

const emptyForm = { id: null, name: "", email: "", password: "", role: "customer", phone: "", userimg: null };

export default function AllUsers() {
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [mode, setMode] = useState("create"); // "create" | "edit"
    const [form, setForm] = useState(emptyForm);
    const token = Cookies.get('token');

    const fetchUsers = async () => {
        try {
            const res = await fetch("http://localhost:3000/getalluser", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setUsers(data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [token]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const openCreate = () => {
        setForm(emptyForm);
        setMode("create");
        setShowModal(true);
    };

    const openEdit = (user) => {
        setForm({ id: user.id, name: user.name, email: user.email, password: "", role: user.role, phone: user.phone || "", userimg: null });
        setMode("edit");
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = mode === "create"
                ? "http://localhost:3000/createuser"
                : `http://localhost:3000/updateuser/${form.id}`;
            const method = mode === "create" ? "POST" : "PUT";

            const formData = new FormData();
            formData.append("name", form.name);
            formData.append("email", form.email);
            formData.append("role", form.role);
            formData.append("phone", form.phone);
            if (form.password) formData.append("password", form.password);
            if (form.userimg) formData.append("userimg", form.userimg);

            const res = await fetch(url, {
                method,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });
            const data = await res.json();

            if (res.ok) {
                Swal.fire({
                    icon: 'success',
                    iconColor: '#059669',
                    title: mode === "create" ? 'User Created!' : 'User Updated!',
                    confirmButtonColor: '#059669',
                });
                setShowModal(false);
                fetchUsers();
            } else {
                Swal.fire({
                    icon: 'error',
                    iconColor: '#059669',
                    title: 'Error!',
                    text: data.message || "Something went wrong.",
                    confirmButtonColor: '#059669',
                });
            }
        } catch (error) {
            console.error("Error saving user:", error);
            Swal.fire({ icon: 'error', title: 'Error!', text: 'Something went wrong.' });
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'This will delete the user and all related products.',
            icon: 'warning',
            iconColor: '#059669',
            showCancelButton: true,
            confirmButtonColor: '#059669',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
        });

        if (result.isConfirmed) {
            try {
                const res = await fetch(`http://localhost:3000/deleteuser/${id}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                });

                const data = await res.json();

                if (res.ok) {
                    Swal.fire({
                        title: 'Deleted!',
                        text: data.message,
                        icon: 'success',
                        iconColor: '#059669',
                        confirmButtonColor: '#059669'
                    });
                    fetchUsers();
                } else {
                    Swal.fire({
                        title: 'Error!',
                        text: data.message || "Error deleting user.",
                        icon: 'error',
                        iconColor: '#059669',
                        confirmButtonColor: '#059669'
                    });
                }
            } catch (error) {
                console.error("Error deleting user:", error);
                Swal.fire({
                    title: 'Error!',
                    iconColor: '#059669',
                    text: 'Something went wrong while deleting.',
                    icon: 'error',
                    confirmButtonColor: '#059669'
                });
            }
        }
    };


    return (
        <section className='w-[95%] lg:w-[80%] mx-auto my-[80px] min-h-screen animate-fadeInUp'>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-[28px] font-semibold">Users</h1>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded hover:opacity-90"
                >
                    <FiPlus /> Create User
                </button>
            </div>
            {
                users.length > 0 ? (
                    <div className="overflow-x-auto card p-0">
                        <table className="min-w-[800px] w-full border border-ink-200 ">
                            <thead className="bg-brand-600 text-white">
                                <tr >
                                    <th className="p-3 border font-semibold">ID</th>
                                    <th className="p-3 border font-semibold">Image</th>
                                    <th className="p-3 border font-semibold">Name</th>
                                    <th className="p-3 border font-semibold">Email</th>
                                    <th className="p-3 border font-semibold">Role</th>
                                    <th className="p-3 border font-semibold">Created At</th>
                                    <th className="p-3 border font-semibold">Edit</th>
                                    <th className="p-3 border font-semibold">Delete</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id} className="text-center hover:bg-ink-50 transition-colors">
                                        <td className="p-3 border">{user.id}</td>
                                        <td className="p-3 border">
                                            <img
                                                src={user.userimg ? `http://localhost:3000${user.userimg}` : "https://via.placeholder.com/48"}
                                                alt={user.name}
                                                className="w-12 h-12 rounded-full object-cover mx-auto hover:scale-110 duration-500"
                                            />
                                        </td>
                                        <td className="p-3 border">{user.name}</td>
                                        <td className="p-3 border">{user.email}</td>
                                        <td className="p-3 border capitalize">{user.role}</td>
                                        <td className="p-3 border">{user.created_at ? new Date(user.created_at).toLocaleDateString() : ''}</td>
                                        <td className="p-3 border">
                                            <button onClick={() => openEdit(user)}>
                                                <FiEdit2 className="text-center mx-auto text-[20px] text-brand-600 hover:scale-110 duration-300" />
                                            </button>
                                        </td>
                                        <td className="p-3 border ">
                                            <button onClick={() => handleDelete(user.id)}>
                                                <GoX className="text-center mx-auto text-[30px] text-red-600 hover:rotate-90 duration-500" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-center text-ink-500">No User found </p>
                )
            }

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 animate-fadeIn">
                    <div className="bg-white rounded-xl2 shadow-soft p-6 w-full max-w-md animate-scaleIn">
                        <h2 className="text-[22px] font-semibold mb-4">
                            {mode === "create" ? "Create User" : "Edit User"}
                        </h2>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                            <input
                                type="text"
                                placeholder="Name"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="input"
                                required
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className="input"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Phone"
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                className="input"
                            />
                            <div>
                                <label className="text-sm text-ink-600">Profile Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setForm({ ...form, userimg: e.target.files[0] })}
                                    className="input w-full"
                                />
                            </div>
                            <input
                                type="password"
                                placeholder={mode === "create" ? "Password" : "New Password (leave blank to keep current)"}
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                className="input"
                                required={mode === "create"}
                            />
                            <select
                                value={form.role}
                                onChange={(e) => setForm({ ...form, role: e.target.value })}
                                className="input"
                            >
                                <option value="customer">Customer</option>
                                <option value="admin">Admin</option>
                            </select>

                            <div className="flex justify-end gap-3 mt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="btn2"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn"
                                >
                                    {mode === "create" ? "Create" : "Save"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
}
