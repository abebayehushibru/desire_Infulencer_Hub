import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft, Building2, Mail, Phone, Lock, Check, MapPin,
    Layers, Globe, Send, Video, FileText, Upload, Eye
} from "lucide-react";

import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";
import Titel from "../../components/common/Titel";

export default function CreateBusiness() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const steps = ["User Information", "Business Profile", "Subscription Type", "Review"];

    // Unified application form state schema
    const [form, setForm] = useState({
        // Step 1: User Information Fields
        name_or_company_name: "",
        email: "",
        phone_1: "",
        phone_2: "",
        password: "",
        confirm_password: "",
        status: "pending",

        // Step 2: Business Profile Fields
        company_address: "",
        business_category: "",
        website: "",
        facebook: "",
        instagram: "",
        telegram: "",
        tiktok: "",
        company_description: "",
        company_logo: null,
        business_license: null,

        // Step 3: Subscription Allocation
        subscription_type: "free",
    });

    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    // Text state field updates handler
    const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

    // Dedicated local binary file parser 
    const handleFileChange = (key) => (e) => {
        if (e.target.files && e.target.files[0]) {
            setForm((f) => ({ ...f, [key]: e.target.files[0] }));
            // Wipe error state once a correct file target is set
            setErrors((err) => ({ ...err, [key]: undefined }));
        }
    };

    // Modular dynamic phase validation engine
    const validateStep = (step) => {
        const e = {};

        if (step === 1) {
            if (!form.name_or_company_name.trim()) e.name_or_company_name = "Company name is required.";
            if (!form.email.trim()) e.email = "Email is required.";
            else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email.";
            if (!form.phone_1.trim()) e.phone_1 = "Primary phone number is required.";
            if (!form.password) e.password = "Password is required.";
            else if (form.password.length < 8) e.password = "Use at least 8 characters.";
            if (form.confirm_password !== form.password || !form.confirm_password)
                e.confirm_password = "Passwords do not match.";
        }

        if (step === 2) {
            if (!form.company_address.trim()) e.company_address = "Company address is required.";
            if (!form.business_category.trim()) e.business_category = "Business category is required.";
            if (!form.company_description.trim()) e.company_description = "Description is required.";
            if (!form.company_logo) e.company_logo = "Company logo image is required.";
            if (!form.business_license) e.business_license = "Business license document upload is required.";
        }

        if (step === 3) {
            if (!form.subscription_type) e.subscription_type = "Select a subscription type.";
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep((prev) => prev + 1);
        }
    };

    const handleBack = () => {
        setErrors({});
        setCurrentStep((prev) => prev - 1);
    };

    const handleStepClick = (stepNumber) => {
        // Blocks moving forward without clean form validations
        if (stepNumber < currentStep) {
            setCurrentStep(stepNumber);
        } else if (stepNumber === currentStep + 1) {
            handleNext();
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!validateStep(1) || !validateStep(2)) {
            alert("Please review Step 1 and Step 2 fields before submitting.");
            return;
        }

        setSubmitting(true);
        try {
            // Package components into a native HTTP FormData payload stack
            const formData = new FormData();
            Object.keys(form).forEach((key) => {
                formData.append(key, form[key]);
            });
            formData.append("role", "business");

            console.log("Submitting Multi-part FormData object payload structure:");
            for (let [key, value] of formData.entries()) {
                console.log(`${key}:`, value);
            }

            // Mock network execution processing pipeline
            // await api.post("/users", formData);
            navigate("/businesses");
        } catch (err) {
            console.error("Submission failed:", err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className=" relative min-h-full min-w-full bg-gray-50/10 flex flex-col gap-4 w-fit mx-auto">
            <Titel titel={"Add Business"} disc={"Complete the pipeline to provision a custom dashboard portal."}/>
           
            {/* ── Stepper Block Component Architecture ── */}
            <div className="flex mx-auto min-w-[600px] mt-1 ">
                <div className="w-full flex items-center">

                    {steps.map((s, i) => {
                        const done = i < currentStep - 1;
                        const active = i === currentStep - 1;
                        return (
                            <div className="flex-1 flex items-center" key={s.label}>
                                <div className="flex flex-col items-center gap-1">
                                    <div
                                        className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors ${done
                                            ? "border-[var(--color-tertiary)] bg-[var(--color-tertiary)] text-[var(--color-primary)]"
                                            : active
                                                ? "border-[var(--color-secondary)] bg-white text-[var(--color-secondary)]"
                                                : "border-slate-200 bg-white text-slate-400"
                                            }`}
                                    >
                                        {done ? <Check className="h-3 w-3" /> : i + 1}
                                    </div>
                                    <span className={`hidden top-full  text-[10px] font-medium sm:block ${active ? "text-[var(--color-secondary)]" : done ? "text-slate-600" : "text-slate-400"}`}>
                                        {s}
                                    </span>
                                </div>
                                {i < steps.length - 1 && (
                                    <div className={`  h-0.5 flex-1 rounded transition-colors  ${i < currentStep-1 ? "bg-[var(--color-tertiary)]" : "bg-slate-200"}`} />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Dynamic Multistep Form Layout Section ── */}
            <div className=" rounded-lg  text-primary border border-gray-200 bg-white p-4 md:p-6 shadow-sm">

                {/* STEP 1: User Account Credentials */}
                {currentStep === 1 && (
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-semibold  uppercase tracking-wide text-gray-400 mb-1">
                                Account Details
                            </h3>
                            <p className="text-xs text-gray-500">Configure administrative profile attributes.</p>
                        </div>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                               <Input
                                    label="Company Name"
                                    name="name_or_company_name"
                                    required
                                    leftIcon={<Building2 size={18} />}
                                    placeholder="Desire Online School"
                                    value={form.name_or_company_name}
                                    onChange={set("name_or_company_name")}
                                    error={errors.name_or_company_name}
                                />
                           

                            <Input
                                label="Email Address"
                                name="email"
                                type="email"
                                required
                                leftIcon={<Mail size={18} />}
                                placeholder="business@example.com"
                                value={form.email}
                                onChange={set("email")}
                                error={errors.email}
                            />

                            

                            <Input
                                label="Primary Phone Number"
                                name="phone_1"
                                required
                                leftIcon={<Phone size={18} />}
                                placeholder="0911223344"
                                value={form.phone_1}
                                onChange={set("phone_1")}
                                error={errors.phone_1}
                            />

                            <Input
                                label="Alternative Phone Number"
                                name="phone_2"
                                leftIcon={<Phone size={18} />}
                                placeholder="0911223344"
                                value={form.phone_2}
                                onChange={set("phone_2")}
                            />
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400 mb-4">
                                Security Password Setup
                            </h3>
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <Input
                                    label="Password"
                                    name="password"
                                    type="password"
                                    required
                                    leftIcon={<Lock size={18} />}
                                    placeholder="At least 8 characters"
                                    value={form.password}
                                    onChange={set("password")} error={errors.password} />
                                <Input
                                    label="Confirm Password"
                                    name="confirm_password"
                                    type="password"
                                    required
                                    leftIcon={<Lock size={18} />}
                                    placeholder="Re-enter password"
                                    value={form.confirm_password}
                                    onChange={set("confirm_password")}
                                    error={errors.confirm_password}
                                />
                            </div>
                        </div>
                    </div>
                )}
                {/* STEP 2: Corporate Brand Profile Details */}
                {currentStep === 2 && (
                    <div className="space-y-0">
                        <h2 className="text-lg font-bold">Business Profile Information</h2>
                        <p className="text-xs">Provide geographical tracking and verified identity items.</p>
                        <div className="grid md:grid-cols-2 gap-x-4 gap-y-2 mt-4">
                            <Input
                                label="Company Office Address"
                                name="company_address"
                                required
                                leftIcon={null}
                                placeholder="Bole, Addis Ababa"
                                value={form.company_address}
                                onChange={set("company_address")}
                                error={errors.company_address}
                            />
                            <Input
                                label="Business Industry Category"
                                name="business_category"
                                required
                                leftIcon={null}
                                placeholder="Education, Retail, Tech"
                                value={form.business_category}
                                onChange={set("business_category")}
                                error={errors.business_category}
                            />
                            <Input
                                label="Official Website Link"
                                name="website"
                                leftIcon={null}
                                placeholder="https://example.com"
                                value={form.website}
                                onChange={set("website")}
                            />
                            <Input
                                label="Facebook Page URL"
                                name="facebook"
                                leftIcon={null}
                                placeholder="facebook.com"
                                value={form.facebook}
                                onChange={set("facebook")}
                            />
                            <Input
                                label="Instagram Handle URL"
                                name="instagram"
                                leftIcon={null}
                                placeholder="instagram.com"
                                value={form.instagram}
                                onChange={set("instagram")}
                            />
                            <Input
                                label="Telegram Group/Channel Link"
                                name="telegram"
                                leftIcon={null}
                                placeholder="t.me"
                                value={form.telegram}
                                onChange={set("telegram")}
                            />
                            <Input
                                label="TikTok Stream Account"
                                name="tiktok"
                                leftIcon={null}
                                placeholder="tiktok.com"
                                value={form.tiktok}
                                onChange={set("tiktok")}
                            />
                        </div>
                        <div className="grid md:grid-cols-2 gap-x-4  ">
                            <Input
                                label="Company Logo"
                                name="company_logo"
                                required
                                leftIcon={null}
                                value={form.company_logo}
                                onChange={set("company_logo")}
                                error={errors.company_logo}
                                type="file"
                            />
                            <Input
                                label="business license"
                                name="business_license"
                                required
                                leftIcon={null}
                                placeholder="Bole, Addis Ababa"
                                value={form.business_license}
                                onChange={set("business_license")}
                                error={errors.business_license}
                                type="file"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Company Description *
                            </label>
                            <textarea
                                className={`w-full rounded-lg border p-3 text-sm shadow-sm outline-none transition focus:border-violet-600 focus:ring-1 focus:ring-violet-600 ${errors.company_description ? "border-red-500" : "border-gray-300"}`}
                                rows={4}
                                placeholder="Elaborate on operational scopes, missions, and team metrics..."
                                value={form.company_description}
                                onChange={set("company_description")}
                            />
                            {errors.company_description && (
                                <p className="text-red-500 text-sm">{errors.company_description}</p>
                            )}
                        </div>
                    </div>
                )}
                {/* STEP 3: Subscription Allocation Strategies */}
                {currentStep === 3 && (
                    <div className="">
                        <p className="text-lg font-semibold text-gray-800">
                            Select Subscription Tier Package
                        </p>
                        <p className="text-xs text-gray-600">
                            Pick an enterprise allocation model tailored to your user bandwidth demands.
                        </p>

                        {/* Standard Free Infrastructure Tier */}
                        <div
                            onClick={() => setForm(f => ({ ...f, subscription_type: "free" }))}
                            className={`border-2 mt-4 rounded-xl p-6 cursor-pointer transition-all ${form.subscription_type === "free" ? "border-violet-600 bg-violet-50/40 shadow-sm" : "border-gray-200 bg-white hover:border-gray-300"}`}
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium text-gray-800">Standard Tier</h3>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${form.subscription_type === "free" ? "border-violet-600 bg-violet-600" : "border-gray-300"}`}>
                                    {form.subscription_type === "free" && (
                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">
                                FreeProvides fundamental directory visibility and limited daily data lookup queries.
                            </p>
                        </div>

                        {/* Premium Pro High Frequency Tier */}
                        <div
                            onClick={() => setForm(f => ({ ...f, subscription_type: "pro" }))}
                            className={`border-2 mt-4  rounded-xl p-6 cursor-pointer transition-all ${form.subscription_type === "pro" ? "border-violet-600 bg-violet-50/40 shadow-sm" : "border-gray-200 bg-white hover:border-gray-300"}`}
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium text-gray-800">Premium Pro</h3>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${form.subscription_type === "pro" ? "border-violet-600 bg-violet-600" : "border-gray-300"}`}>
                                    {form.subscription_type === "pro" && (
                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">
                                $49 / mo
                            </p>
                            <p className="text-sm text-gray-600 mt-2">
                                Unlocks programmatic API indexing channels, custom analytics cards, and continuous support.
                            </p>
                        </div>
                    </div>
                )}
                {/* STEP 4: Parameters Compilation Review Panel */}
                {currentStep === 4 &&
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-gray-8₀₀">Final Manifest Review Verification</h3>
                        <p className="text-sm text-gray_6₀₀">
                            Double-check administrative records before pushing changes to cloud infrastructure storage arrays.
                        </p>

                        {/* COMPANY BRAND */}
                        <div className="flex items-start space-x_4">
                            <span className="font-medium text-gray_8₀₀">COMPANY BRAND:</span>
                            <span>{form.name_or_company_name || "—"}</span>
                        </div>

                        {/* EMAIL ACCOUNT */}
                        <div className="flex items-start space-x_4">
                            <span className="font-medium text-gray_8₀₀">EMAIL ACCOUNT:</span>
                            <span>{form.email || "—"}</span>
                        </div>

                        {/* PRIMARY COMMUNICATIONS */}
                        <div className="flex items-start space-x_4">
                            <span className="font-medium text-gray_8₀₀">PRIMARY COMMUNICATIONS:</span>
                            <span>{form.phone_1 || "—"}</span>
                        </div>

                        {/* ACCOUNT REGISTRATION STATUS */}
                        <div className="flex items-start space-x_4">
                            <span className="font-medium text-gray_8₀₀">ACCOUNT REGISTRATION STATUS:</span>
                            <span>{form.status}</span>
                        </div>

                        {/* PHYSICAL LOCATION HQ */}
                        <div className="flex items-start space-x_4">
                            <span className="font-medium text-gray_8₀₀">PHYSICAL LOCATION HQ:</span>
                            <span>{form.company_address || "—"}</span>
                        </div>

                        {/* BUSINESS DOMAIN SEGMENT */}
                        <div className="flex items-start space-x_4">
                            <span className="font-medium text-gray_8₀₀">BUSINESS DOMAIN SEGMENT:</span>
                            <span>{form.business_category || "—"}</span>
                        </div>

                        {/* SUMMARY OBJECTIVES */}
                        <div className="flex items-start space-x_4">
                            <span className="font-medium text-gray_8₀₀">SUMMARY OBJECTIVES:</span>
                            <span>{form.company_description || "No description provided."}</span>
                        </div>

                        {/* PROVISION PLAN */}
                        <div className="flex items-start space-x_4">
                            <span className="font-medium text-gray_8₀₀">PROVISION PLAN:</span>
                            <span>{form.subscription_type}</span>
                        </div>

                        {/* Logo */}
                        <div className="flex items-start space-x_4">
                            <span className="font-medium text-gray_8₀₀">Logo:</span>
                            <span>{form.company_logo ? form.company_logo.name : "Missing file"}</span>
                        </div>

                        {/* License */}
                        <div className={"flex items-start space-x_4"}>
                            {"License:"}
                            {"{form.business_license ? form.business_license.name : \"Missing file\"}"}
                        </ div>
                    </div>
                }
                <div className="flex justify-end w-full  gap-4 mt-6 ">
                    
                
                <Button type="button" variant="outline" onClick={currentStep === 1 ? () => navigate(-1) : handleBack}>{currentStep === 1 ? "Cancel" : "Back"}</Button>
                {currentStep < 4 ? <Button type="button"  onClick={handleNext}>Continue</Button> : <Button type="submit" disabled={submitting} onClick={handleSubmit}>{submitting ? "Processing..." : "Complete Setup"}</Button>}
            </div>
            </div>

        </div>
    );
}