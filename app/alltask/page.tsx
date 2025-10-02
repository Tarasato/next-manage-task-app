"use client"

import Image from "next/image";
import tasklogo from "./../../assets/images/tasklogo.png";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

//data type
type Task = {
  id: string;
  created_at: string;
  title: string;
  detail: string;
  image_url: string;
  is_completed: boolean;
  update_at: string;
}

export default function Page() {
  //create state for store task data that fetch from supabase for display at Page
  const [tasks, setTasks] = useState<Task[]>([]);

  //fetch data from supabase
  useEffect(() => {
    const fetchTasks = async () => {
      const { data, error } = await supabase
        .from('task_tb')
        .select('id, created_at, title, detail, image_url, is_completed, update_at') // also can use '*' for all columns
        .order('created_at', { ascending: false }); //latest data first

      if (error) {
        console.log("error", error);
      } else {
        setTasks(data as Task[]);
      }
    }
    fetchTasks();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("คุณต้องการลบงานนี้ใช่หรือไม่?")) {

      // หา image_url ก่อนลบ
      const task = tasks.find(t => t.id === id);

      if (task?.image_url) {
        // ดึงเฉพาะ path หลัง task_bk/
        const imagePath = task.image_url.split('/task_bk/')[1];
        // const imagePath = oldImageUrl.split('/').pop();

      if (imagePath) {
        const { error: storageError } = await supabase
          .storage
          .from('task_bk')
          .remove([imagePath]);
        if (storageError) {
          console.error('Error deleting image:', storageError);
        }
      }
    }

      const { error } = await supabase
        .from('task_tb')
        .delete()
        .eq('id', id);
      if (error) {
        console.log("error", error);
      } else {
        //remove task from state
        setTasks(tasks.filter((task) => task.id !== id));
      }

    }
  }

  return (
    <div className="p-20">
      <div className="flex flex-col items-center">
        <Image src={tasklogo} alt="tasklogo" width={100} height={100} />
        <h1 className="text-xl font-bold mt-5 mb-7">
          Manage Task App
        </h1>
      </div>

      <div className="flex flex-row-reverse">
        <Link href="/addtask"
          className="text-white hover:text-blue-700 block
                     w-sm px-4 py-2 rounded border bg-blue-500 text-center">
          เพิ่มงาน
        </Link>
      </div>

      <div className="mt-20 mb-20">
        <table className="min-w-full border border-gray-700 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border">รูป</th>
              <th className="border">Title</th>
              <th className="border">Detail</th>
              <th className="border">Status</th>
              <th className="border">วันที่เพิ่ม</th>
              <th className="border">วันที่แก้ไข</th>
              <th className="border">Action</th>
            </tr>
          </thead>
          <tbody>
            {/* loop data from state */}
            {tasks.map((task) => (
              <tr key={task.id}>
                <td className="border p-2">
                  {task.image_url ? (
                    <div className="flex justify-center items-center">
                      <Image
                        src={task.image_url}
                        alt={task.title}
                        width={100}
                        height={100}
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="text-center">ไม่มีรูปภาพ</div>
                  )}
                </td>
                <td className="border p-2 text-center">{task.title}</td>
                <td className="border p-2 text-center">{task.detail}</td>
                <td className="border p-2 text-center">{task.is_completed ? "เสร็จสิ้น✅" : "ยังไม่เสร็จสิ้น❌"}</td>
                <td className="border p-2 text-center">{new Date(task.created_at).toLocaleString()}</td>
                <td className="border p-2 text-center">{new Date(task.update_at).toLocaleString()}</td>
                <td className="border p-2 text-center">
                  <Link href={`/edittask/${task.id}`} className="text-blue-500 hover:text-blue-800 hover:underline mr-2">
                    แก้ไข
                  </Link>
                  <button onClick={() => handleDelete(task.id)} className="text-red-500 hover:text-red-800 hover:underline cursor-pointer">
                    ลบ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Link href="/addtask"
        className="text-blue-500 hover:bg-blue-200 block
                     px-4 py-2 rounded text-center mt-10">
        กลับสู่หน้าหลัก
      </Link>
    </div>
  )
}