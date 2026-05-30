"use client";

export default function ProfilePreview() {
  return (
    <section className="section profile" id="profile">
      <div className="profile-visual">
        <img src="/assets/gang-hero.png" alt="Wongnuashuajing gang profile visual" />
      </div>
      <div className="profile-copy">
        <p className="eyebrow">Profile Preview</p>
        <h2>หน้าโปรไฟล์ RP รายบุคคล</h2>
        <p>แสดงประวัติ ยศ อาวุธประจำตัว สไตล์การเล่น badge ความสำเร็จ และประวัติร่วมกิจกรรม พร้อมพื้นหลัง matrix ทองตาม brief</p>
        <div className="badge-row">
          <span>First Strike</span>
          <span>MVP Month</span>
          <span>Loyal Member</span>
        </div>
      </div>
    </section>
  );
}
