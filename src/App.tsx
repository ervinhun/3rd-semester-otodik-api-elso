import './App.css'
import {useEffect, useState} from "react";
import type {Activity} from "../Api.ts";
import {MyApi} from "./MyApi.ts";


function App() {

    const [activities, setActivities] = useState<Activity[]>([])
    const [createNewActivityForm, setCreateNewActivityForm] = useState<Activity>({
        dueDate: new Date().toISOString(),
        completed: false,
        id: 123,
        title: ''
    })

    useEffect(() => {
        getActivities()
    }, [])

    return (
        <>
            <input value={createNewActivityForm.title!} onChange={e =>
                setCreateNewActivityForm({...createNewActivityForm, title: e.target.value})}  />
            <button onClick={() => {
                MyApi.api.v1ActivitiesCreate(createNewActivityForm).then(result => {
                    setActivities([...activities, result.data])
                })
            }}>Create new activity</button>
            {
                activities.map(activity => {
                    return <div>{activity.title}, is completed:
                        <input type="checkbox" checked={activity.completed} /></div>
                })
            }
        </>
    )

    function getActivities() {
        MyApi.api.v1ActivitiesList().then(activities => {
            setActivities(activities.data)
        })
    }
}

export default App