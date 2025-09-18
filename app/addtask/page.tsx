"use client"

import Image from "next/image";
import tasklogo from "./../../assets/images/tasklogo.png";
import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  //create state for work with data
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleSelectImage = () => {
    const fileInput = document.getElementById('fileInput');
    fileInput?.click();
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    //upload image to supabase storage
    let imageUrl = "";

    if (image) {
      const newImgFileName = `${Date.now()}-${image.name}`;
      const { data, error } = await supabase
        .storage
        .from('task_bk') //storage bucket name
        .upload(newImgFileName, image); //file path and file
      if (error) {
        alert("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ");
        return;
      } else {
        //fetch public Image url
        const { data } = supabase.storage.from('task_bk').getPublicUrl(newImgFileName);
        imageUrl = data.publicUrl;
      }
    }

    //insert data to supabase
    const { data, error } = await supabase
      .from('task_tb')
      .insert([
        {
          title: title,
          detail: detail,
          image_url: imageUrl,
          is_completed: isCompleted,
        }
      ]);
    if (error) {
      console.log("error", error);
    } else {
      //back to alltask page
      alert("บันทึกข้อมูลเรียบร้อย");
      router.push("/alltask");
    }
  }

  return (
    <div className="p-20">
      <div className="flex flex-col items-center">
        <Image src={tasklogo} alt="Task Logo" width={100} height={100} />
        <h1 className="text-xl font-bold mt-5 mb-7">Manage Task App</h1>
      </div>

      <div className="w-3xl border border-gray-500 p-10 mx-auto rounded-xl">
        <h1 className="text-xl font-bold text-center">เพิ่มงานใหม่</h1>

        <form onSubmit={handleSaveTask} className="w-full space-y-4">
          <div>
            <label>ชื่องาน</label>
            <input type="text" className="w-full border rounded-lg p-2" required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label>รายละเอียด</label>
            <textarea className="w-full border rounded-lg p-2" rows={5} required
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1">อัปโหลดรูป</label>
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <label
              className="inline-block bg-blue-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-600"
              onClick={handleSelectImage}
            >
              เลือกรูป
            </label>
            {previewImage && (
              <div className="mt-4">
                <Image src={previewImage} alt="Preview" width={150} height={150} className="mt-2" />
              </div>
            )}
          </div>
          <div>
            <label>สถานะ</label>
            <select className="w-full border rounded-lg p-2"
              value={isCompleted ? "1" : "0"}
              onChange={(e) => setIsCompleted(e.target.value === "1")}
            >
              {/* 0 = false, 1 = true */}
              <option disabled>-- เลือกสถานะ --</option>
              <option value="0">ยังไม่เสร็จสิ้น❌</option>
              <option value="1">เสร็จสิ้น✅</option>
            </select>
          </div>
          <div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              บันทึกงานใหม่
            </button>
          </div>
        </form>
        <Link href={"/alltask"} className="text-blue-500 w-full text-center mt-5 block hover:text-blue-600 hover:underline">กลับไปหน้าแสดงงานทั้งหมด</Link>
      </div>

    </div>
  )
}