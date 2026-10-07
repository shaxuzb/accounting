import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import "dayjs/locale/uz-latn";

dayjs.extend(isoWeek);
dayjs.locale("uz-latn");

export default dayjs;
