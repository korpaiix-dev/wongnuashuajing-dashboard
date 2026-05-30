"use client";
import RoleGate from "./RoleGate";

export default function Events() {
  return (
    <section className="section events" id="events">
      <div className="section-heading"><p className="eyebrow">Event Management</p><h2>จัดการกิจกรรมและประกาศ</h2></div>
      <div className="event-grid">
        <RoleGate minRole="member" as="article" className="event-card">
          <span className="badge">Tonight</span>
          <h3>War Training</h3>
          <p>ฝึกทีมยิง ทีมขับ และทีมซัพพอร์ต แยกคะแนน MVP หลังจบกิจกรรม</p>
          <div className="event-meta"><span>22:00</span><button className="row-action" type="button">ลงชื่อ</button></div>
        </RoleGate>
        <article className="event-card image-card">
          <img src="/assets/gang-hero.png" alt="Wongnuashuajing recruitment banner" />
          <div>
            <span className="badge">Register</span>
            <h3>Join The Family</h3>
            <p>พื้นที่รับสมัครสมาชิกหญิง พร้อมระบบคัดกรองและส่งแจ้งเตือน Discord</p>
          </div>
        </article>
        <RoleGate minRole="secretary" as="article" className="event-card">
          <span className="badge">Secretary</span>
          <h3>Audit & Strike</h3>
          <p>เก็บประวัติการลงโทษ คะแนนกิจกรรม และ log การแก้ไขข้อมูลสมาชิก</p>
          <div className="event-meta"><span>5 pending</span><span>2 urgent</span></div>
        </RoleGate>
      </div>
    </section>
  );
}
