import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import "dayjs/locale/uz";

dayjs.extend(isoWeek);
dayjs.locale("uz");

export default dayjs;
