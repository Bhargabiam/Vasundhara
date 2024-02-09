/*
Template Name: Admin Pro Admin
Author: Wrappixel
Email: niravjoshi87@gmail.com
File: js
*/
$(function () {
  "use strict";

  // Get dates Current date, 7, 15, 30 days before date
  let currentDate = new Date();
  // Genarate past date
  let dateGenerator = (cd, d) => {
    let nD = new Date(cd);
    nD.setDate(nD.getDate() - d);
    return nD;
  };
  // Create 7,15,30 days before date
  let thertyDaysBefore = dateGenerator(currentDate, 30);
  let fifteenDaysBefore = dateGenerator(currentDate, 15);
  let sevenDaysBefore = dateGenerator(currentDate, 7);
  // Get the last day of the previous month
  let lastDayOfPreviousMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    0
  );
  // Get the first day of the previous month
  let firstDayOfPreviousMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() - 1,
    1
  );
  // Get the last day of the 2 previous month
  let lastDayOf2PreviousMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() - 1,
    0
  );
  // Get the first day of the 2 previous month
  let firstDayOf2PreviousMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() - 2,
    1
  );

  // Format dates as 'YYYY-MM-DD'
  var formatDate = function (date) {
    var year = date.getFullYear();
    var month = ("0" + (date.getMonth() + 1)).slice(-2);
    var day = ("0" + date.getDate()).slice(-2);
    return year + "-" + month + "-" + day;
  };
  // all Formated Dates
  let currentFormatDate = formatDate(currentDate);
  let sevenBeforeFormat = formatDate(sevenDaysBefore);
  let fifteenBeforeFormat = formatDate(fifteenDaysBefore);
  let thertyBeforeFormat = formatDate(thertyDaysBefore);
  let pevFirstBeforeFormat = formatDate(firstDayOfPreviousMonth);
  let pevLastBeforeFormat = formatDate(lastDayOfPreviousMonth);
  let tpevFirstBeforeFormat = formatDate(firstDayOf2PreviousMonth);
  let tpevLastBeforeFormat = formatDate(lastDayOf2PreviousMonth);

  $(document).ready(function () {
    // Total Client Count
    axios
      .get("/report/totalClient")
      .then((res) => {
        let countValue = res.data;
        let $clientCount = $("#clint-count");
        $clientCount.html(countValue);
      })
      .catch((err) => {
        if (err.response.status === 404) {
          console.log(err.response.data.err);
        } else {
          console.log(err.message);
        }
      });

    // Total Active Inprocess Count
    axios
      .get("/report/totalActiveQuery")
      .then((res) => {
        let activeQuery = res.data;
        let $activeQueryBar = $("#activeQuery-progress-bar-inner");
        let $activeQueryCount = $("#active-query-count");
        $activeQueryCount.html(activeQuery);
        $activeQueryBar.css("width", (activeQuery / 300) * 100 + "%");
        $activeQueryBar.attr("aria-valuenow", activeQuery);
      })
      .catch((err) => {
        if (err.response.status === 404) {
          console.log(err.response.data.err);
        } else {
          console.log(err.message);
        }
      });

    // Total close Inprocess Count
    axios
      .get(`/report/totalCloseQuery/${thertyBeforeFormat}/${currentFormatDate}`)
      .then((res) => {
        let closeQuery = res.data;
        let $closeQueryBar = $("#closeQuery-progress-bar-inner");
        $("#close-Query-count").html(closeQuery);
        $closeQueryBar.css("width", closeQuery + "%");
        $closeQueryBar.attr("aria-valuenow", closeQuery);
      })
      .catch((err) => {
        if (err.response.status === 404) {
          console.log(err.response.data.err);
        } else {
          console.log(err.message);
        }
      });

    // Total complete Count
    axios
      .get(`/report/totalSale/${thertyBeforeFormat}/${currentFormatDate}`)
      .then((res) => {
        let complete = res.data;
        let $completeBar = $("#complete-progress-bar-inner");
        $("#complete-count").html(complete);
        $completeBar.css("width", complete + "%");
        $completeBar.attr("aria-valuenow", complete);
      })
      .catch((err) => {
        if (err.response.status === 404) {
          console.log(err.response.data.err);
        } else {
          console.log(err.message);
        }
      });

    //   ============== Get Status Ratio ===============================//
    const getStatusRatioData = async (val) => {
      let date;
      if (val == 1) {
        date = `${sevenBeforeFormat}/${currentFormatDate}`;
      } else if (val == 2) {
        date = `${fifteenBeforeFormat}/${currentFormatDate}`;
      } else if (val == 3) {
        date = `${thertyBeforeFormat}/${currentFormatDate}`;
      } else {
        date = `${pevFirstBeforeFormat}/${pevLastBeforeFormat}`;
      }

      try {
        const response = await axios.get(`/report/statusCount/${date}`);
        const { Happy, UnHappy, Service, Casual } = response.data;
        return {
          happyCount: Happy,
          unHappyCount: UnHappy,
          serviceCount: Service,
          casualCount: Casual,
        };
      } catch (err) {
        console.log(err.message);
      }
    };

    // ==============================================================
    // status ratio tags changed
    // ==============================================================
    const statusTagChanged = (
      happyCount,
      unHappyCount,
      serviceCount,
      casualCount
    ) => {
      $("#happy-ratio").html(`${happyCount}%`);
      $("#unHappy-ratio").html(`${unHappyCount}%`);
      $("#service-ratio").html(`${serviceCount}%`);
      $("#casual-ratio").html(`${casualCount}%`);
    };
    //   =================================================================
    // Status ratio
    // =================================================================

    const statusRatioChartGenerator = async (val) => {
      var { happyCount, unHappyCount, serviceCount, casualCount } =
        await getStatusRatioData(val);
      statusChartChanged(happyCount, unHappyCount, serviceCount, casualCount);
      statusTagChanged(happyCount, unHappyCount, serviceCount, casualCount);
    };
    // onpage Load status ratio chart create
    statusRatioChartGenerator(1);

    $("#status-select").change(() => {
      statusRatioChartGenerator($("#status-select").val());
    });

    // get sales count using date

    axios
      .get(`/report/salesCount/${thertyBeforeFormat}/${currentFormatDate}`)
      .then((response) => {
        var data = response.data;
        const salesCountArray = data.map((item) => parseInt(item.count));
        generateSalesCount(salesCountArray);
      })
      .catch((error) => {
        console.error(error.message);
      });
  });

  // ==============================================================
  // sales ratio
  // ==============================================================
  var chart = new Chartist.Line(
    ".sales",
    {
      labels: [1, 2, 3, 4, 5, 6, 7],
      series: [
        [24.5, 20.3, 42.7, 32, 34.9, 48.6, 40],
        [8.9, 5.8, 21.9, 5.8, 16.5, 6.5, 14.5],
      ],
    },
    {
      low: 0,
      high: 48,
      showArea: true,
      fullWidth: true,
      plugins: [Chartist.plugins.tooltip()],
      axisY: {
        onlyInteger: true,
        scaleMinSpace: 40,
        offset: 20,
        labelInterpolationFnc: function (value) {
          return value / 10 + "k";
        },
      },
    }
  );

  // Offset x1 a tiny amount so that the straight stroke gets a bounding box
  // Straight lines don't get a bounding box
  // Last remark on -> http://www.w3.org/TR/SVG11/coords.html#ObjectBoundingBox
  chart.on("draw", function (ctx) {
    if (ctx.type === "area") {
      ctx.element.attr({
        x1: ctx.x1 + 0.001,
      });
    }
  });

  // Create the gradient definition on created event (always after chart re-render)
  chart.on("created", function (ctx) {
    var defs = ctx.svg.elem("defs");
    defs
      .elem("linearGradient", {
        id: "gradient",
        x1: 0,
        y1: 1,
        x2: 0,
        y2: 0,
      })
      .elem("stop", {
        offset: 0,
        "stop-color": "rgba(255, 255, 255, 1)",
      })
      .parent()
      .elem("stop", {
        offset: 1,
        "stop-color": "rgba(64, 196, 255, 1)",
      });
  });

  var chart = [chart];

  // ==============================================================
  // campaign
  // ==============================================================

  const statusChartChanged = (
    happyCount,
    unHappyCount,
    serviceCount,
    casualCount
  ) => {
    var chart = c3.generate({
      bindto: "#statusRatio",
      data: {
        columns: [
          ["Happy", happyCount],
          ["UnHappy", unHappyCount],
          ["Service", serviceCount],
          ["Casual", casualCount],
        ],

        type: "donut",
        tooltip: {
          show: true,
        },
      },
      donut: {
        label: {
          show: false,
        },
        width: 15,
      },

      legend: {
        hide: true,
      },
      color: {
        pattern: ["#137eff", "#8b5edd", "#5ac146", "#fa5838"],
      },
    });
  };

  // ==============================================================
  // weather
  // ==============================================================
  var chart = c3.generate({
    bindto: ".weather-report",
    data: {
      columns: [["Day 1", 21, 15, 30, 45, 15]],
      type: "area-spline",
    },
    axis: {
      y: {
        show: false,
        tick: {
          count: 0,
          outer: false,
        },
      },
      x: {
        show: false,
      },
    },
    padding: {
      top: 0,
      right: -8,
      bottom: -28,
      left: -8,
    },
    point: {
      r: 2,
    },
    legend: {
      hide: true,
    },
    color: {
      pattern: ["#5ac146"],
    },
  });
  // ==============================================================
  // Our Visitor
  // ==============================================================
  const generateSalesCount = (data) => {
    // var sparklineLogin = function () {
    $("#earnings").sparkline(data, {
      type: "bar",
      height: "40",
      barWidth: "4",
      width: "100%",
      resize: true,
      barSpacing: "8",
      barColor: "#137eff",
    });
    // };
  };
  var sparkResize;

  $(window).resize(function (e) {
    clearTimeout(sparkResize);
    sparkResize = setTimeout(sparklineLogin, 500);
  });
  sparklineLogin();

  // ==============================================================
  // world map
  // ==============================================================
  jQuery("#visitfromworld").vectorMap({
    map: "world_mill_en",
    backgroundColor: "transparent",
    borderColor: "#fff",
    borderOpacity: 0,
    borderWidth: 0,
    zoomOnScroll: false,
    color: "rgba(223,226,233, 0.8)",
    regionStyle: {
      initial: {
        fill: "rgba(223,226,233, 0.8)",
        "stroke-width": 1,
        stroke: "rgba(223,226,233, 0.8)",
      },
    },
    markerStyle: {
      initial: {
        r: 5,
        fill: "#dfe2e9",
        "fill-opacity": 1,
        stroke: "#dfe2e9",
        "stroke-width": 1,
        "stroke-opacity": 1,
      },
    },
    enableZoom: true,
    hoverColor: "#79e580",
    markers: [
      {
        latLng: [21.0, 78.0],
        name: "India : 9347",
        style: {
          fill: "#2961ff",
        },
      },
      {
        latLng: [-33.0, 151.0],
        name: "Australia : 250",
        style: {
          fill: "#2961ff",
        },
      },
      {
        latLng: [36.77, -119.41],
        name: "USA : 250",
        style: {
          fill: "#2961ff",
        },
      },
      {
        latLng: [55.37, -3.41],
        name: "UK   : 250",
        style: {
          fill: "#2961ff",
        },
      },
      {
        latLng: [25.2, 55.27],
        name: "UAE : 250",
        style: {
          fill: "#2961ff",
        },
      },
    ],
    hoverOpacity: null,
    normalizeFunction: "linear",
    scaleColors: ["#93d5ed", "#93d5ee"],
    selectedColor: "#cbd0db",
    selectedRegions: [],
    showTooltip: true,
    onRegionClick: function (element, code, region) {
      var message =
        'You clicked "' +
        region +
        '" which has the code: ' +
        code.toUpperCase();
      alert(message);
    },
  });
});
