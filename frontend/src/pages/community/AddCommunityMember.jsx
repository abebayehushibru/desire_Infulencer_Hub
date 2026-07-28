import { Search, Send, User, X } from "lucide-react";
import useApi from "../../hooks/useApi";
import { useEffect, useState } from "react";
import SearchSelect from "../../components/common/SearchSelect";
import { formatFollowers } from "../../services/helpers";
import Select from "../../components/common/Select";

const PURPLE = "#2E1C8D";
const NAVY = "#16115A";

function Avatar({ name, size = 36 }) {
  const initials = name ? name.split(" ").map((p) => p[0]).slice(0, 2).join("") : "";
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{ width: size, height: size, fontSize: size * 0.36, background: `linear-gradient(135deg, ${PURPLE}, ${NAVY})` }}
    >
      {initials}
    </div>
  );
}

const AddMemberModal = ({ onClose, id }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userOptions, setUserOptions] = useState([]);
  
  // Form States for submission
  const [role, setRole] = useState('member');
  const [message, setMessage] = useState('');

  // Fixed path syntax bug (changed single quotes to backticks)
  const influencerApi = useApi({
    request: (payload) => ({
      method: "GET",
      path: `/communities/${id}/members/non-members`,
      query: payload,
      manual: true
    }),
  });

  const memberApi = useApi({
    request: (payload) => ({
      method: "POST",
      path: `/communities/${id}/members`,
      data: payload,
    }),
  });

  useEffect(() => {
    if (!searchTerm.trim()) {
      setUserOptions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      const result = await influencerApi.execute({ search: searchTerm, limit: 10 });
      if (result.success) {
        const formatted = result?.data?.data?.rows?.map(inf => ({
          label: `${inf?.name_or_company_name} (${inf?.email})`,
          value: inf?.id,
          data: inf
        }));
        setUserOptions(formatted);
      }
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Submission Handler
  const handleSubmit = async () => {
    if (!selectedUser?.id) {
      alert("Please select a user to invite.");
      return;
    }

    const payload = {
      user_id: selectedUser.id,
      role: role,
      message: message,
      successMsg:`${selectedUser?.name_or_company_name} added successfully.`

    };

    const result = await memberApi.execute(payload);
    
    if (result.success) {
      // Close the modal or trigger a success state refresh on success
      onClose(); 
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-md rounded-[20px] bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-800">Add Community Member</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
        </div>
        
        <div className="space-y-2">
          {/* Search User Input */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Search User</label>
            <div className="relative">
              <SearchSelect
                icon={User}
                placeholder="Search for user by name or email"
                options={userOptions}
                isLoading={influencerApi?.loading}
                onInputChange={(inputValue) => setSearchTerm(inputValue)}
                onChange={(selectedOption) => {
                  setSelectedUser(selectedOption?.data || null);
                }}
              /> 
            </div>
          </div>

          {/* Selected User Badge */}
          {selectedUser?.id && (
            <div className="flex items-center gap-3 rounded-lg border border-slate-100 p-3">
              <Avatar name={selectedUser?.name_or_company_name} size={40} />
              <div>
                <div className="text-sm font-semibold text-slate-700">{selectedUser?.name_or_company_name}</div>
                <div className="text-xs text-slate-600">
                  {formatFollowers(selectedUser?.influencer_profile?.followers_count)} followers · {selectedUser?.influencer_profile?.main_platform}
                </div>
              </div>
            </div>
          )}

          {/* Role Dropdown Selector */}
          <div>
            <label className="mb-1 mt-2 block text-xs font-medium text-slate-500">Community Role</label>
            <Select 
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Select a community role"
             
              data={[{ value: 'leader', label: 'Leader' },{ value: 'agent', label: 'Agent' }, { value: 'member', label: 'Member' }]} 
            />
          </div>

          {/* Invite Message Input */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Invite Message</label>
            <textarea 
              rows={3} 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Say hello and share what's next for the community..." 
              className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[var(--color-secondary)]" 
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:border-slate-300">
            Cancel
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={memberApi?.loading}
            className="flex items-center gap-1.5 rounded-lg bg-[var(--color-secondary)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-primary)] disabled:opacity-50"
          >
            <Send className="h-4 w-4" /> 
            {memberApi?.loading ? "Sending..." : "Send Invitation"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddMemberModal;
