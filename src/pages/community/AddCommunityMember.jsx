import { ArrowLeft, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Button from "../../components/commen/Button";
import Input from "../../components/commen/Input";
import Select from "../../components/commen/Select";
import TextArea from "../../components/commen/TextArea";

export default function AddCommunityMember() {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-500 hover:text-primary mb-2"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back
          </button>

          <h1 className="text-2xl font-bold text-primary">
            Add Influencer to Community
          </h1>

          <p className="text-gray-500 mt-1">
            Search an influencer and assign them to this community.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

        {/* Search */}
        <div className="mb-8">
          <label className="block mb-2 font-medium">
            Search Influencer
          </label>

          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                name="search"
                placeholder="Search by name, email or phone..."
              />
            </div>

            <Button leftIcon={<Search size={18} />}>
              Search
            </Button>
          </div>
        </div>

        {/* Selected Influencer */}
        <div className="border rounded-xl p-5 bg-gray-50 mb-8">

          <h3 className="font-semibold text-lg mb-4">
            Influencer Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <Input
              label="Full Name"
              value="Abebe Kebede"
              disabled
            />

            <Input
              label="Platform"
              value="TikTok"
              disabled
            />

            <Input
              label="Followers"
              value="145,000"
              disabled
            />

            <Input
              label="Level"
              value="Diamond"
              disabled
            />

            <Input
              label="Location"
              value="Addis Ababa"
              disabled
            />

            <Input
              label="Profile Link"
              value="https://tiktok.com/@abebe"
              disabled
            />
          </div>
        </div>

        {/* Role */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <Select
            name="role"
            label="Community Role"
            data={[
              {
                label: "Member",
                value: "member",
              },
              {
                label: "Agent",
                value: "agent",
              },
              {
                label: "Leader",
                value: "leader",
              },
            ]}
          />

          <div />
        </div>

        <div className="mt-5">
          <TextArea
            name="note"
            label="Note (Optional)"
            placeholder="Write additional notes..."
            rows={4}
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-8">

          <Button
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>

          <Button>
            Add to Community
          </Button>

        </div>
      </div>
    </div>
  );
}