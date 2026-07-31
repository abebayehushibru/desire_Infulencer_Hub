import { useEffect, useState } from "react";
import { MessageCircle, Users, Loader2, X } from "lucide-react";

import useApi from "../hooks/useApi";
import SearchSelect from "./common/SearchSelect";
import Input from "./common/Input";

export default function CreateChat({
  open,
  onClose,
  campaignId,
   campaignName,
  onSuccess,
}) {
  const [search, setSearch] = useState("");
  const [agentOptions, setAgentOptions] = useState([]);
  const [agentId, setAgentId] = useState("");

  const agentsApi = useApi({
    request: (payload) => ({
      method: "GET",
      path: "/users",
      query: {
        role: "agent",
        ...payload,
      },
      data:{successMsg:"red"},
      manual: true,
    }),
  });

  const createApi = useApi({
    request: (payload) => ({
      method: "POST",
      path: `/chats/campaign/${campaignId}`,
      data: payload,
      manual: true,
    }),
  });

  useEffect(() => {

    const timer = setTimeout(async () => {
      const res = await agentsApi.execute({
        search,
        limit: 10,
      });

      if (res.success) {
        setAgentOptions(
          res.data.data.rows.map((item) => ({
            label: `${item.name_or_company_name} (${item.email})`,
            value: item.id,
          }))
        );
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!agentId) return;

    const res = await createApi.execute({
      agent_id: agentId,
      successMsg: "Chat created successfully",
    });

    if (res.success) {
      onSuccess?.(res.data);
      onClose();
      setAgentId("");
      setSearch("");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

        {/* Header */}
        <div className="flex justify-between items-center border-b p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
              <MessageCircle className="text-primary" size={22} />
            </div>

            <div>
              <h2 className="font-bold text-lg">
                Create Campaign Chat
              </h2>

              <p className="text-gray-500 text-sm">
                Assign an Agent to manage this campaign conversation.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="hover:bg-gray-100 rounded-lg p-2"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6"
        >
            <div>

            <label className="font-medium mb-2 block">
              Campaign
            </label>

            <Input value={campaignName } disabled>

            </Input>

          </div>
          <div>

            <label className="font-medium mb-2 block">
              Select Agent
            </label>

            <SearchSelect
              icon={Users}
              placeholder="Search agent..."
              options={agentOptions}
              isLoading={agentsApi.loading}
              value={search}
              onInputChange={setSearch}
              onChange={(option) => {
                setAgentId(option.value);
              }}
            />

          </div>

          <div className="bg-primary/5 rounded-xl p-4 text-sm text-gray-600">
            The selected agent will become responsible for managing
            conversations between the business and influencers for this
            campaign.
          </div>

          <div className="flex justify-end gap-3">

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg border"
            >
              Cancel
            </button>

            <button
              disabled={!agentId || createApi.loading}
              className="px-5 py-2 rounded-lg bg-primary text-white hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
            >
              {createApi.loading && (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              )}

              Create Chat
            </button>

          </div>
        </form>

      </div>
    </div>
  );
}