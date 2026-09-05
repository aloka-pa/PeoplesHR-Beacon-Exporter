(async function (args) {
    const otData = BeaconBar.getSharedData("otData");
    const empnumber = BeaconBar.getSharedData("priorEmployee");
    const employeedata = BeaconBar.getSharedData("employeedata");
    const EmpDisplayNumber = employeedata.EmpDisplayNumber;
    const EmpDisplayName = employeedata.EmpDisplayName;
    const EmpHeaderName = employeedata.EmpHeaderName;

    const convertTimeToHours = (timeStr) => {
        if (!timeStr || timeStr === "" || timeStr === "-") return -1;
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours + (minutes / 60);
    };

    const formatHoursForAPI = (hours) => hours === -1 ? -1 : parseFloat(hours.toFixed(2));

    const convertDateFormat = (dateStr) => {
        if (!dateStr || dateStr === "-") return null;
        const [month, day, year] = dateStr.split('/');
        return `${2000 + parseInt(year)}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00`;
    };

    const getShiftCode = (shiftName) => ({ "OFS": "000013", "S-DS": "000054" }[shiftName] || "000054");

    const getMaxOTByShift = (shiftName, type) =>
        shiftName === "OFS" ? (type === "pre" ? 0 : 10) : 10;

    const getShiftColor = (shiftName) => ({ "OFS": "#FFFF00", "S-DS": "#33CCFF" }[shiftName] || "#33CCFF");

    const formatTimeDisplay = (hours) => {
        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };

    const getNextDay = (dateStr) => {
        const [month, day, year] = dateStr.split('/');
        const date = new Date(2000 + parseInt(year), parseInt(month) - 1, parseInt(day));
        date.setDate(date.getDate() + 1);
        return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear().toString().slice(-2)}`;
    };

    const generateShiftTooltip = (dayData) => {
        const date = dayData.Date;
        const nextDay = getNextDay(date);
        if (dayData["Shift Name"] === "OFS") {
            return `00.00 - 00.00 [Grace Start Time - ${date} 04:00 Grace End Time ${nextDay} 08:00]`;
        } else {
            return `07.00 - 15.00 [Grace Start Time - ${date} 00:30 Grace End Time ${nextDay} 06:30]`;
        }
    };

    const generateDynamicGridData = () => Array.from({ length: 6 }, (_, i) => ({
        "SeqNo": i + 1,
        "ColumnId": 1,
        "ColumnValue": i === 4 ? "1.00" : "0.00",
        "IsVisible": false
    }));

    const { preOT, postOT, reason, comment, selectedDates } = args;

    const priorOTDetailList = otData.map((dayData) => {
        const isSelected = selectedDates?.includes(dayData.Date) ?? false;

        let preOTHours = -1, postOTHours = -1, reasonCode = "-1", commentText = "";

        if (isSelected) {
            preOTHours = preOT ? convertTimeToHours(preOT) : -1;
            postOTHours = postOT ? convertTimeToHours(postOT) : -1;
            reasonCode = reason || "-1";
            commentText = comment || "";
        } else {
            if (dayData["Pre OT"] && dayData["Pre OT"] !== "-") {
                preOTHours = convertTimeToHours(dayData["Pre OT"]);
            }
            if (dayData["Post OT"] && dayData["Post OT"] !== "-") {
                postOTHours = convertTimeToHours(dayData["Post OT"]);
            }
            reasonCode = dayData.Reason || "-1";
            commentText = dayData.Comment || "";
        }

        return {
            EmpDisplayNumber,
            EmpDisplayName,
            EmpHeaderName,
            PriorDetail: {
                DatInDate: convertDateFormat(dayData.Date),
                EmpNumber: empnumber,
                RosterCode: dayData.RosterCode || "000032",
                ShiftCode: dayData.ShiftCode || getShiftCode(dayData["Shift Name"]),
                InDate: convertDateFormat(dayData["In Date"]),
                InTime: -1,
                OutDate: convertDateFormat(dayData["Out Date"]),
                OutTime: -1,
                MaxPreOT: dayData["Max Pre OT"] !== "-" ? parseFloat(dayData["Max Pre OT"]) : getMaxOTByShift(dayData["Shift Name"], "pre"),
                MaxPostOT: dayData["Max Post OT"] !== "-" ? parseFloat(dayData["Max Post OT"]) : getMaxOTByShift(dayData["Shift Name"], "post"),
                IsFlexyShift: 0,
                IsOffShift: dayData["Shift Name"] === "OFS" ? 1 : 0,
                PreOTHours: formatHoursForAPI(preOTHours),
                PostOTHours: formatHoursForAPI(postOTHours),
                IsUnlimited: 0,
                Comment: commentText,
                ReasonCode: reasonCode,
                AppApproved: -2,
                PriorOTApproved: 1,
                CancelApproved: 0,
                BatchID: -1,
                WFMainID: null
            },
            ShiftAbbreviation: dayData["Shift Name"],
            ShiftColor: getShiftColor(dayData["Shift Name"]),
            Message: "",
            IsHaveApproval: 0,
            DatInDate: convertDateFormat(dayData.Date),
            InDateText: dayData["In Date"],
            OutDateText: dayData["Out Date"],
            PreOTHrsText: preOTHours > 0 ? formatTimeDisplay(preOTHours) : "",
            PostOTHrsText: postOTHours > 0 ? formatTimeDisplay(postOTHours) : "",
            DynamicGridDataList: generateDynamicGridData(),
            RecordType: 3,
            RecordStatus: 0,
            RecordStatusText: "U/R",
            IsPreOTEnable: dayData["Shift Name"] !== "OFS",
            IsLockRecord: false,
            IsEnabled: true,
            IsSelected: isSelected,
            IsPreOTUnlimited: false,
            IsPostOTUnlimited: false,
            ShiftToolTip: generateShiftTooltip(dayData),
            OldIsPreOTUnlimited: false,
            OldIsPostOTUnlimited: false,
            OldPreOTHours: -1,
            OldPostOTHours: -1,
            OldComment: "",
            OldReasonCode: "-1"
        };
    });

    const payload = {
        PageMode: 0,
        PriorOTDetailList: priorOTDetailList
    };

    const myHeaders = new Headers({
        "accept": "*/*",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
        "content-type": "application/json",
        "origin": "https://devtest-echoengineers.phrsandbox.dev",
        "priority": "u=0, i",
        "referer": "https://devtest-echoengineers.phrsandbox.dev/hrb5/home/RenderIframeModules",
        "sec-ch-ua": '"Google Chrome";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
        "x-requested-with": "XMLHttpRequest"
    });

    const reqOptions = await BeaconBar.executeFunction("reqOptions")();
    const response = await fetch(`${reqOptions}tnav9/api/PriorOT/SubmitPriorOTApplication/`, {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify(payload),
        redirect: "follow"
    });

    return await response.text();
})
