export const dueInfo = (student) => {
  if (!student || student.feeStatus === "paid") return null;

  // Parse the date correctly.
  const dueDate = student.feeDueDate ? new Date(student.feeDueDate) : null;
  if (!dueDate) return null;
// Compare dates only, ignoring the time component.
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  const diffTime = dueDate - today;
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let label = "";
  let level = "";

  if (days < 0) {
    label = `Overdue by ${Math.abs(days)} day(s)`;
    level = "overdue";
  } else if (days === 0) {
    label = "Due today";
    level = "today";
  } else if (days === 1) {
    label = "Due tomorrow";
    level = "tomorrow";
  } else {
    label = `Due in ${days} days`;
    level = "upcoming";
  }

  return { days, label, level };
};

export const whatsappLink = (student) => {
  const msg = `Hi ${student.name}, your study hall fee of Rs.${student.feeAmount} is due. Please pay at the earliest. Thank you.`;
  return `https://wa.me/91${student.phoneNo}?text=${encodeURIComponent(msg)}`;
};