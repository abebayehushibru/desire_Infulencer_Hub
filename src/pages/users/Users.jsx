import { useEffect, useState } from "react";
import { Search, Plus, Mail, Phone, BadgeCheck, ShieldOff } from "lucide-react";
import Table, { ActionMenu } from "../../components/common/Table";
import Pagination from "../../components/Pagination";
import useApi from "../../hooks/useApi";
import Button from "../../components/common/Button";
import Select from "../../components/common/Select";
import Input from "../../components/common/Input";
import Title from "../../components/common/Title";
import Avatar from "../../components/common/Avatar";

const ROLE_STYLES = {
    super_admin: "bg-purple-50 text-purple-700 ring-purple-600/20",
    admin: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
    business: "bg-blue-50 text-blue-700 ring-blue-600/20",
    influencer: "bg-pink-50 text-pink-700 ring-pink-600/20",
    agent: "bg-teal-50 text-teal-700 ring-teal-600/20",
};

const STATUS_STYLES = {
    active: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
    inactive: "bg-slate-100 text-slate-600 ring-slate-500/20",
    blocked: "bg-red-50 text-red-700 ring-red-600/20",
};

function Badge({ text, styles }) {
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset ${styles}`}>
            {text.replace("_", " ")}
        </span>
    );
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

/* ----------------------------
   Users List Page
-----------------------------*/

export default function UsersListPage({ onCreate, onEdit, onView }) {
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [activeMenu, setActiveMenu] = useState(null);

    // GET /users — manual so we control exactly when it fires (filters/page/limit change).
    const usersApi = useApi({
        request: (payload) => ({
            method: "GET",
            path: "/users",
            query: payload,
            manual: true,
        }),
    });

    // Status changes and delete each fire their own manual request.
    const updateStatusApi = useApi({
        request: ({ id, status }) => ({
            method: "PATCH",
            path: `/users/${id}`,
            body: { status },
            manual: true,
        }),
    });

    const deleteUserApi = useApi({
        request: (id) => ({
            method: "DELETE",
            path: `/users/${id}`,
            manual: true,
        }),
    });

    function fetchUsers() {
        // NOTE: swap `.execute` below for whatever trigger method your useApi hook
        // actually returns (e.g. `.run`, `.call`, `.fetch`) — the request/query
        // shape is correct, only the method name may need to change.
        usersApi.execute({
            search: search || undefined,
            role: roleFilter !== "all" ? roleFilter : undefined,
            status: statusFilter !== "all" ? statusFilter : undefined,
            page,
            limit,
        });
    }

    // Refetch whenever filters/page/limit change, debounced for the search box.
    useEffect(() => {
        const timeout = setTimeout(fetchUsers, search ? 300 : 0);
        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, roleFilter, statusFilter, page, limit]);

    // Adjust these two lines to match your API's actual response envelope
    // (e.g. { data, meta: { total } } vs { data, total } vs a raw array).
    const users = usersApi.data?.data?.rows ?? [];
    const total = usersApi.data?.data?.count ?? users.length;

    const totalPages = Math.max(1, Math.ceil(total / limit));
    const loading = usersApi.loading;

    async function updateStatus(id, status) {
        await updateStatusApi.execute({ id, status });
        fetchUsers();
    }

    async function handleDelete(user) {
        if (!confirm(`Delete ${user.name_or_company_name}? This can't be undone.`)) return;
        await deleteUserApi.execute(user.id);
        fetchUsers();
    }

    const columns = [
        {
            key: "name_or_company_name",
            label: "User",
            render: (value, row) => (
                <div className="flex items-center gap-3">
                <Avatar name={value} src={row.avatar_url} size={32} className="flex-shrink-0" />
                    <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-slate-800">{value}</div>
                        <div className="flex items-center gap-1 truncate text-xs text-slate-400">
                            <Mail size={11} /> {row.email}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            key: "phone1",
            label: "Phone",
            render: (value) => (
                <span className="flex items-center gap-1.5 text-sm text-slate-600">
                    <Phone size={13} className="text-slate-400" /> {value}
                </span>
            ),
        },
        {
            key: "role",
            label: "Role",
            render: (value) => <Badge text={value} styles={ROLE_STYLES[value]} />,
        },
        {
            key: "status",
            label: "Status",
            render: (value) => <Badge text={value} styles={STATUS_STYLES[value]} />,
        },
        {
            key: "verified",
            label: "Verified",
            render: (_, row) => (
                <div className="flex items-center gap-2">
                    {row.email_verified ? (
                        <BadgeCheck size={16} className="text-emerald-500" title="Email verified" />
                    ) : (
                        <ShieldOff size={16} className="text-slate-300" title="Email not verified" />
                    )}
                    {row.phone_verified ? (
                        <BadgeCheck size={16} className="text-emerald-500" title="Phone verified" />
                    ) : (
                        <ShieldOff size={16} className="text-slate-300" title="Phone not verified" />
                    )}
                </div>
            ),
        },
        {
            key: "created_at",
            label: "Joined",
            render: (value) => <span className="text-sm text-slate-500">{formatDate(value)}</span>,
        },
        {
            key: "actions",
            label: "",
            render: (_, row, rowIndex) => (
                <div className="flex justify-end">
                    <ActionMenu
                        index={rowIndex}
                        active={activeMenu}
                        setActive={setActiveMenu}

                        onEdit={() => onEdit?.(row)}
                        onApprove={row.status === "pending" ? () => updateStatus(row.id, "active") : undefined}
                        onMakeActive={row.status === "inactive" ? () => updateStatus(row.id, "active") : undefined}
                        onReject={row.status !== "blocked" ? () => updateStatus(row.id, "blocked") : undefined}
                        onDelete={() => handleDelete(row)}
                    />
                </div>
            ),
        },
    ];

    return (
        <>

            <Title
                titel="Users"
                disc="Manage all registered users."
            >
                <Button
                    leftIcon={<Plus size={18} />}
                    onClick={() => onCreate?.()}
                >
                    Add User
                </Button>
            </Title>

            <div className="bg-white mt-4 rounded-lg border border-gray-200 shadow-sm p-4">

                {/* Filters */}
                <div className="flex  flex-row gap-2 items-center justify-between mb-3">

                    <Input
                        name="search"
                        value={search}
                        placeholder="Search by name or email..."
                        className="w-full md:w-50"
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                    />

                    <Select
                        name="role"
                        value={roleFilter}
                        data={[
                            { label: "All Roles", value: "all" },
                        
                            { label: "Admin", value: "admin" },
                            { label: "Business", value: "business" },
                            { label: "Influencer", value: "influencer" },
                            { label: "Agent", value: "agent" },
                        ]}
                        onChange={(e) => {
                            setRoleFilter(e.target.value);
                            setPage(1);
                        }}
                    />

                    <Select
                        name="status"
                        value={statusFilter}
                        data={[
                            { label: "All Status", value: "all" },
                            { label: "Pending", value: "pending" },
                            { label: "Active", value: "active" },
                            { label: "Inactive", value: "inactive" },
                            { label: "Blocked", value: "blocked" },
                        ]}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPage(1);
                        }}
                    />

                    <Button
                        className="flex items-center gap-2"
                        loading={loading}
                        onClick={fetchUsers}
                    >
                        <Search size={18} />
                        <span className="hidden sm:inline">Search</span>
                    </Button>

                </div>

                <Table
                    columns={columns}
                    data={users}
                    loading={loading}
                />

                <Pagination
                    page={page}
                    total={total}
                    totalPages={totalPages}
                    limit={limit}
                    onPageChange={(pg) => {
                        setPage(pg);
                    }}
                    onLimitChange={(l) => {
                        setLimit(l);
                        setPage(1);
                    }}
                />

            </div>

        </>
    );
}