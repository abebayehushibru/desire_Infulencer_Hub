import React, { useState } from "react";
import Input from "./common/Input";
import Textarea from "./common/Textarea";
import Button from "./common/Button";

const AddReview = ({ id }) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex gap-4 justify-between">
                <Input
                    label="Name"
                    value="abebayehu"
                    disabled={true}
                />
                {/* Rating */}
                <div className="w-xs">
                    <p className="mb-1 text-sm font-medium">Rating</p>

                    <div className="flex gap-1 text-xl cursor-pointer">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <span
                                key={star}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHover(star)}
                                onMouseLeave={() => setHover(0)}
                                style={{
                                    color:
                                        star <= (hover || rating)
                                            ? "#FEB209"
                                            : "#d1d5db",
                                    transition: "0.2s",
                                }}
                            >
                                ★
                            </span>
                        ))}
                    </div>
                </div>

            </div>


            <Textarea
                label="Message"
                value=""
                placeholder="Write your review..."
            />


            <Button
                className="mt-4 px-4 py-2 rounded text-white"
                style={{ backgroundColor: "#16115A" }}
            >
                Submit Review
            </Button>
        </div>
    );
};

export default AddReview;