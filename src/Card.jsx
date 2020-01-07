import React from "react";

const Card = ({ image, code }) => {

    return (
        <img className="card" src={image} alt={code} />
    );
};

export default Card;
