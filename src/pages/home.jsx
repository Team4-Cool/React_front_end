import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const Home = () => {
    const [boards, setBoards] = useState([]);
    const [users, setUsers] = useState({});
    const [newBoardName, setNewBoardName] = useState("");
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchBoards();
    }, [token]);

    const fetchBoards = () => {
        axios.get('http://127.0.0.1:8000/api/boards', {
            headers: { Authorization: `Token ${token}` }
        })
            .then(response => {
                setBoards(response.data);
                response.data.forEach(board => {
                    if (!users[board.owner]) {
                        axios.get(`http://127.0.0.1:8000/api/users/${board.owner}`, {
                            headers: { Authorization: `Token ${token}` }
                        })
                            .then(userResponse => {
                                setUsers(prevUsers => ({ ...prevUsers, [board.owner]: userResponse.data.username }));
                            })
                            .catch(error => console.error("Error fetching user:", error));
                    }
                });
            })
            .catch(error => console.error("Error fetching boards:", error));
    };

    const createBoard = () => {
        axios.post('http://127.0.0.1:8000/api/boards/', { name: newBoardName }, {
            headers: { Authorization: `Token ${token}` }
        })
            .then(() => {
                setNewBoardName("");
                fetchBoards();
            })
            .catch(error => console.error("Error creating board:", error));
    };

    const updateBoard = (id, newName) => {
        axios.patch(`http://127.0.0.1:8000/api/boards/${id}/`, { name: newName }, {
            headers: { Authorization: `Token ${token}` }
        })
            .then(fetchBoards)
            .catch(error => console.error("Error updating board:", error));
    };

    const deleteBoard = (id) => {
        axios.delete(`http://127.0.0.1:8000/api/boards/${id}/`, {
            headers: { Authorization: `Token ${token}` }
        })
            .then(fetchBoards)
            .catch(error => console.error("Error deleting board:", error));
    };

    return (
        <div className="container mt-4">
            <h1>Boards List</h1>
            <div className="mb-3">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Enter board name"
                    value={newBoardName}
                    onChange={e => setNewBoardName(e.target.value)}
                />
                <button className="btn btn-success mt-2" onClick={createBoard}>Create Board</button>
            </div>
            <div className="row">
                {boards.map(board => (
                    <div key={board.id} className="col-md-4 mb-3">
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <h5 className="card-title">{board.name}</h5>
                                <p className="card-text">Owner: {users[board.owner] || "Loading..."}</p>
                                <Link to={`/boards/${board.id}`} className="btn btn-primary">View</Link>
                                <button className="btn btn-warning mx-2" onClick={() => updateBoard(board.id, prompt("Enter new name:", board.name))}>Edit</button>
                                <button className="btn btn-danger" onClick={() => deleteBoard(board.id)}>Delete</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;
