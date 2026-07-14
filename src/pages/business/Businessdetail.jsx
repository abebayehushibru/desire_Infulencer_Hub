import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Pencil,
  Ban,
  CheckCircle2,
  Calendar,
  Clock,
  ShieldAlert,
} from "lucide-react";

import Button from "../../components/common/Button";

// Stand-in for a record loaded from the API — swap for a real fetch by :id.
const SAMPLE_BUSINESS = {
  id: "b1f0c2b2-2f3a-4a5b-9e2a-6d1f2c3a4b5c",
  name_or_company_name: "Desire Online School",
  email: "info@desire.et",
  phone_1: "0911223344",
  phone_2: "",
  role: "business",
  status: "active",
  login_attempts: 0,
  created_at: "2025-11-02T09:14:00Z",
  updated_at: "2026-07-10T14:02:00Z",
};

const STATUS_STYLE = {
  active: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  inactive: "bg-gray-100 text-gray-600",
  suspended: "bg-red-100 text-red-600",
};

export default function BusinessDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const business = SAMPLE_BUSINESS; // TODO: fetch by id

  const isSuspended = business.status === "suspended";

  return (
    <div className="min-h-full bg-gray-50">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-gray-700"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="max-w-3xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Building2 size={26} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-bold text-primary">{business.name_or_company_name}</h1>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_STYLE[business.status]}`}
                >
                  {business.status}
                </span>
              </div>
              <p className="text-sm text-gray-400">Business Account</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              leftIcon={<Pencil size={16} />}
              onClick={() => navigate(`/businesses/edit/${id ?? business.id}`)}
            >
              Edit
            </Button>
            <Button
              variant={isSuspended ? "primary" : "outline"}
              leftIcon={isSuspended ? <CheckCircle2 size={16} /> : <Ban size={16} />}
              onClick={() => console.log(isSuspended ? "Activate" : "Suspend", business.id)}
              className={!isSuspended ? "text-red-600 border-red-200 hover:bg-red-50" : ""}
            >
              {isSuspended ? "Activate" : "Suspend"}
            </Button>
          </div>
        </div>

        {/* Contact info */}
        <div className="mt-6 grid grid-cols-1 gap-4 border-t border-gray-100 pt-6 sm:grid-cols-2">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 text-gray-400">
              <Mail size={16} />
            </span>
            <div>
              <p className="text-xs text-gray-400">Email</p>
              <p className="text-sm font-medium text-gray-700">{business.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 text-gray-400">
              <Phone size={16} />
            </span>
            <div>
              <p className="text-xs text-gray-400">Phone Number</p>
              <p className="text-sm font-medium text-gray-700">{business.phone_1}</p>
            </div>
          </div>

          {business.phone_2 && (
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 text-gray-400">
                <Phone size={16} />
              </span>
              <div>
                <p className="text-xs text-gray-400">Alternative Phone</p>
                <p className="text-sm font-medium text-gray-700">{business.phone_2}</p>
              </div>
            </div>
          )}
        </div>

        {/* Account meta */}
        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-100 pt-6 sm:grid-cols-4">
          <div>
            <p className="flex items-center gap-1 text-xs text-gray-400">
              <ShieldAlert size={12} /> Login Attempts
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-700">{business.login_attempts}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Role</p>
            <p className="mt-1 text-sm font-semibold capitalize text-gray-700">{business.role}</p>
          </div>
          <div>
            <p className="flex items-center gap-1 text-xs text-gray-400">
              <Calendar size={12} /> Created
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-700">
              {new Date(business.created_at).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="flex items-center gap-1 text-xs text-gray-400">
              <Clock size={12} /> Last Updated
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-700">
              {new Date(business.updated_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}