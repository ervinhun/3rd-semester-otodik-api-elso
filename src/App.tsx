import './App.css'
import {useEffect, useState} from "react"
import type {Activity} from "../Api.ts"
import {MyApi} from "./MyApi.ts"

function App() {

    const [activities, setActivities] = useState<Activity[]>([])
    const [createNewActivityForm, setCreateNewActivityForm] = useState<Activity>({
        dueDate: new Date().toISOString(),
        completed: false,
        id: 0,
        title: ''
    })

    // load activities when component mounts
    useEffect(() => {
        getActivities()
    }, [])

    return (
        <>
            {/* CREATE activity form */}
            <input
                value={createNewActivityForm.title!}
                onChange={e =>
                    setCreateNewActivityForm({...createNewActivityForm, title: e.target.value})
                }
                placeholder="New activity title"
            />
            <button onClick={() => {
                MyApi.api.v1ActivitiesCreate(createNewActivityForm).then(result => {
                    setActivities([...activities, result.data])
                    setCreateNewActivityForm({...createNewActivityForm, title: ''}) // reset input
                    alert("Created on backend: " + JSON.stringify(result.data));
                })
            }}>
                Create new activity
            </button>

            {/* LIST all activities */}
            {
                activities.map(activity => {
                    return (
                        <div key={activity.id}>
                            {/* Inline editable title */}
                            <input
                                type="text"
                                value={activity.title}
                                onChange={e => updateTitle(activity, e.target.value)}
                            />

                            {/* Completion toggle */}
                            <label style={{marginLeft: "1rem"}}>
                                Completed:{" "}
                                <input
                                    type="checkbox"
                                    checked={activity.completed}
                                    onChange={() => toggleCompleted(activity)}
                                />
                            </label>

                            {/* Delete button */}
                            <button style={{marginLeft: "1rem"}} onClick={() => deleteActivity(activity.id)}>
                                ❌ Delete
                            </button>
                        </div>
                    )
                })
            }
        </>
    )

    // READ all activities
    function getActivities() {
        MyApi.api.v1ActivitiesList().then(activities => {
            setActivities(activities.data)
            console.log("API response (get):", activities.status, activities.statusText);

        })
    }

    // UPDATE completion status
    function toggleCompleted(activity: Activity) {
        const updated = {...activity, completed: !activity.completed}
        MyApi.api.v1ActivitiesUpdate(activity.id, updated).then(result => {
            setActivities(activities.map(a => a.id === activity.id ? result.data : a))
            console.log("API response (completed):", result.status, result.statusText);
        })
    }

    // UPDATE title inline
    function updateTitle(activity: Activity, newTitle: string) {
        const updated = {...activity, title: newTitle}
        setActivities(activities.map(a => a.id === activity.id ? updated : a)) // immediate local update

        // sync with backend
        MyApi.api.v1ActivitiesUpdate(activity.id, updated).then(result => {
            console.log("API response (update):", result.data, result.status, result.statusText);
            setActivities(activities.map(a => a.id === activity.id ? result.data : a))
        })
    }

    // DELETE activity
    function deleteActivity(id: number) {
        MyApi.api.v1ActivitiesDelete(id).then(() => {
            setActivities(activities.filter(a => a.id !== id))
            console.log("API response (delete):", id, "deleted successfully");
        })
    }
}

export default App
