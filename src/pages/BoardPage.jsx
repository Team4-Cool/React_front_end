import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import Column from "../components/Board/Column.jsx";

const BoardView = () => {
    const { id } = useParams();
    const [board, setBoard] = useState(null);
    const [editingColumn, setEditingColumn] = useState(null);
    const [newColumnName, setNewColumnName] = useState("");
    const token = localStorage.getItem('token');

    const fetchBoard = () => {
        axios.get(`http://109.87.215.193:8000/api/boards/${id}`, {
            headers: {
                Authorization: `Token ${token}`
            }
        })
            .then(response => {
                setBoard(response.data);
            })
            .catch(error => console.error("Error fetching board:", error));
    };

    useEffect(() => {
        fetchBoard();
    }, [id, token]);

    const handleEditColumn = (column) => {
        setEditingColumn(column.id);
        setNewColumnName(column.name);
    };

    const saveColumnName = async (columnId) => {
        if (!newColumnName.trim()) {
            return;
        }

        try {
            const response = await axios.put(
                `http://109.87.215.193:8000/api/columns/${columnId}/`,
                {
                    title: newColumnName,
                    board: board.id
                },
                {
                    headers: {
                        'Authorization': `Token ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Update local state
            setBoard(prevBoard => {
                const updatedColumns = prevBoard.columns.map(column =>
                    column.id === columnId ? { ...column, name: newColumnName } : column
                );
                return { ...prevBoard, columns: updatedColumns };
            });

            console.log('Column name updated successfully:', response.data);
        } catch (error) {
            console.error('Error updating column name:', error);
            console.log('Response:', error.response?.data);
        } finally {
            setEditingColumn(null);
            setNewColumnName("");
        }
    };

    if (!board) {
        return <div className="container mt-4">Loading...</div>;
    }

    return (
        <div className="container mt-4">
            <h1>{board.name}</h1>
            <p>Owner: {board.members.find(m => m.id === board.owner)?.username || "Unknown"}</p>

            <div style={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'nowrap',
                gap: '16px',
                overflowX: 'auto',
                padding: '8px 0'
            }}>
                {board.columns.map((column, index) => {
                    return (
                        <Column
                            key={column.id}
                            column={{
                                ...column,
                                header: editingColumn === column.id ? (
                                    <div className="d-flex align-items-center">
                                        <input
                                            type="text"
                                            className="form-control form-control-sm"
                                            value={newColumnName}
                                            onChange={(e) => setNewColumnName(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    saveColumnName(column.id);
                                                }
                                            }}
                                        />
                                        <button
                                            className="btn btn-sm btn-success ms-2"
                                            onClick={() => saveColumnName(column.id)}
                                        >
                                            Save
                                        </button>
                                        <button
                                            className="btn btn-sm btn-secondary ms-1"
                                            onClick={() => setEditingColumn(null)}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span>{column.name}</span>
                                        <button
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() => handleEditColumn(column)}
                                        >
                                            Edit
                                        </button>
                                    </div>
                                )
                            }}
                            index={index}
                            tasks={column.tasks || []}
                            editTask={(task) => console.log("Edit task:", task)}
                            addNewTask={(taskData) => console.log("Add new task:", taskData)}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default BoardView;
