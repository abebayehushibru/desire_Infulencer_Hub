const Title = ({ titel, disc, children }) => {
    return <div className=" flex-1 -m-4 -mb-0 shadow-sm sticky bg-white p-4   flex justify-beteween ">
        <div className="flex-1">
            <h1 className="text-lg font-bold text-primary">{titel}</h1>
            <p className="mt-0 text-xs text-gray-500">{disc}</p>
        </div>

        {children}
    </div>
}

export default Title