import { createEvent } from "@/server-actions/events";
import SubmitButton from "@/components/SubmitButton";

export default function CreateEvent() {
  return (
    <div>
      <div className="page-head">
        <p className="eyebrow">Admin</p>
        <h1>สร้างกิจกรรม / สตอรี่</h1>
        <p>กด Broadcast → Discord จะโพสต์พร้อมปุ่ม เข้าร่วม/ไม่เข้าร่วม</p>
      </div>

      <form action={createEvent} className="card form" style={{ maxWidth: 720, padding: 24 }}>
        <div className="form-row">
          <label>ประเภท</label>
          <select name="type" defaultValue="story">
            <option value="airdrop">Airdrop</option>
            <option value="story">Story</option>
            <option value="war">War</option>
            <option value="meeting">Meeting</option>
            <option value="training">Training</option>
          </select>
        </div>
        <div className="form-row">
          <label>ชื่อกิจกรรม</label>
          <input name="title" required placeholder="เช่น Story vs แก๊ง A" />
        </div>
        <div className="form-row">
          <label>เวลา</label>
          <input name="when_at" type="datetime-local" required />
        </div>
        <div className="grid grid-2">
          <div className="form-row">
            <label>สถานที่ (ไม่บังคับ)</label>
            <input name="location" placeholder="เช่น Cayo / Downtown" />
          </div>
          <div className="form-row">
            <label>คู่ต่อสู้ / แก๊งฝั่งตรงข้าม</label>
            <input name="enemy_gang" placeholder="ถ้าเป็น Story / War" />
          </div>
        </div>
        <div className="form-row">
          <label>คะแนนเข้าร่วม (default ตามประเภท)</label>
          <input name="points_reward" type="number" placeholder="ปล่อยว่างใช้ค่าตามประเภท" />
        </div>
        <div className="form-row">
          <label>รายละเอียดเพิ่มเติม</label>
          <textarea name="notes" rows={3} placeholder="briefing / เตรียมตัวยังไง" />
        </div>
        <label className="flex" style={{ marginTop: 4 }}>
          <input type="checkbox" name="broadcast" defaultChecked style={{ width: 16, height: 16 }} />
          <span>📢 Broadcast ไป Discord ทันที (ปุ่ม RSVP)</span>
        </label>
        <SubmitButton className="btn btn-primary btn-block" pendingText="กำลังสร้าง…">สร้างกิจกรรม</SubmitButton>
      </form>
    </div>
  );
}
