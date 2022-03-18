import React, { useRef, useState, useEffect } from "react";
import CurveTypes from "./CurveTypes";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import annotationPlugin from "chartjs-plugin-annotation";
import RadioGroup from "@mui/material/RadioGroup";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import ChartFooter from "./ChartFooter";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  zoomPlugin,
  annotationPlugin
);

const chartSettings = {
  fill: false,
  lineTension: 0.05,
  pointBorderWidth: 1,
  pointHoverRadius: 6,
  pointHoverBorderColor: "black",
  pointHoverBorderWidth: 5,
  pointRadius: 1,
  pointHitRadius: 10,
};

const additionalChartSetting = {
  label: "Rate",
  borderColor: "rgba(255, 10, 63, 1)",
  backgroundColor: "rgba(255, 10, 63, 0.4)",
  pointBorderColor: "rgba(255, 10, 63, 1)",
  pointBackgroundColor: "rgba(255, 10, 63, 1)",
  pointHoverBackgroundColor: "rgba(255, 10, 63, 1)",
};
const additionalFitChartSetting = {
  label: "FIT_CURVE",
  borderColor: "rgba(25, 114, 231, 1)",
  backgroundColor: "rgba(25, 114, 231, 1)",
  pointBorderColor: "rgba(25, 114, 231, 0.4)",
  pointBackgroundColor: "rgba(25, 114, 231, 1)",
  pointHoverBackgroundColor: "rgba(25, 114, 231, 1)",
};

const zoomSettings = {
  pan: {
    enabled: true,
    mode: "xy",
  },
  zoom: {
    wheel: {
      enabled: true,
    },
    pinch: {
      enabled: true,
    },
    mode: "xy",
  },
};

const optionSettings = {
  responsive: true,
  scales: {
    x: {
      gridLines: {
        display: true,
      },
      title: {
        display: true,
        text: "Time",
        font: {
          family: "Comic Sans MS",
          size: 20,
          weight: "bold",
          lineHeight: 1.2,
        },
        padding: { top: 20, left: 0, right: 0, bottom: 0 },
      },
    },

    y: {
      gridLines: {
        display: true,
      },
      title: {
        display: true,
        text: "Rate",
        font: {
          family: "Comic Sans MS",
          size: 20,
          weight: "bold",
          lineHeight: 1.2,
        },
        padding: { top: 20, left: 0, right: 0, bottom: 0 },
      },
    },
  },
  legend: {
    display: true,
  },
  tooltips: {
    enabled: true,
  },
  plugins: {
    zoom: zoomSettings,
  },
};
const peakLineOptionAnno = {
  type: "line",
  borderColor: "black",
  borderWidth: 4,
  scaleID: "x",
};

const labelOptionsAnno = {
  enabled: true,
  backgroundColor: "black",
  borderColor: "black",
  borderRadius: 10,
  borderWidth: 2,
  position: "start",
};

const DetectionChart = ({ chartData, peakData, isOpen }) => {
  const [value, setValue] = useState("raw");
  const [width, setWidth] = useState("w-full");
  const [stitchOpen, setStitchOpen] = useState(false);
  const [showPeaks, setShowPeaks] = useState(false);
  const handleShowPeak = () => {
    setShowPeaks(!showPeaks);
  };
  const handleStitch = () => {
    setStitchOpen(!stitchOpen);
  };
  const chartRef = useRef(null);

  const { origTime, time, rate, convolve, stitch } = chartData;
  const { catClass, decayTime, riseTime, peakFlux, peakArr, startArr, endArr } =
    peakData;

  const [datasetArr, setDatasetArr] = useState([
    {
      ...chartSettings,
      ...additionalChartSetting,
      data: rate,
    },
  ]);

  const [lineOptions, setLineOptions] = useState(optionSettings);

  let annotateArr = [];
  console.log(peakArr);
  peakArr.forEach((value, index) => {
    annotateArr.push({
      ...peakLineOptionAnno,
      label: {
        ...labelOptionsAnno,
        content: [
          `Peak Time: ${origTime[value]}`,
          `Start Time: ${startArr[index]}`,
          `End Time: ${endArr[index]}`,
        ],
      },
      value: (Math.round(value / 50) * 50) / 50,
    });
  });
  useEffect(() => {
    const setRawCurve = () => {
      setDatasetArr([
        {
          ...chartSettings,
          ...additionalChartSetting,
          data: rate,
        },
      ]);
      setLineOptions((prev) => {
        let obj = { ...prev, plugins: { zoom: zoomSettings } };
        return obj;
      });
    };
    const setStitchConvolveCurve = () => {
      setDatasetArr([
        {
          ...chartSettings,
          ...additionalFitChartSetting,
          data: stitch,
        },
        {
          ...chartSettings,
          ...additionalChartSetting,
          data: convolve,
        },
      ]);
    };

    const setOnlyConvolveCurve = () => {
      setDatasetArr([
        {
          ...chartSettings,
          ...additionalChartSetting,
          data: convolve,
        },
      ]);
    };

    const peakLineOption = {
      ...optionSettings,
      onClick: (e, element) => {
        if (element.length > 0) {
          var ind = element[0].index;
          alert(`${chartData.x[ind]}, ${chartData.y[ind]}`);
        }
      },
      plugins: {
        zoom: zoomSettings,
        annotation: {
          annotations: annotateArr,
        },
      },
    };
    if (value === "raw") setRawCurve();
    else {
      if (stitchOpen) {
        setStitchConvolveCurve();
      } else {
        setOnlyConvolveCurve();
      }
      if (showPeaks) setLineOptions(peakLineOption);
      else {
        setLineOptions((prev) => {
          let obj = { ...prev, plugins: { zoom: zoomSettings } };
          return obj;
        });
      }
    }
  }, [value, rate, convolve, stitchOpen, stitch, showPeaks]);

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  const resetZoom = () => {
    chartRef.current.resetZoom();
  };
  const zoomIn = () => {
    chartRef.current.zoom(1.1);
  };
  const zoomOut = () => {
    chartRef.current.zoom(0.9);
  };

  useEffect(() => {
    if (isOpen) setWidth("w-4/5");
    else setWidth("w-4/5");
  }, [isOpen]);

  const data = {
    labels: time,
    datasets: datasetArr,
  };

  return (
    <div className="flex justify-center items-center w-full">
      <div
        className={`flex flex-col ${width} items-center bg-white rounded-lg pr-10 pl-5 pb-5 mb-5 ml-5`}
      >
        <p className="font-bold text-xl p-3">
          Detection of solar bursts in X-Ray light curve data
        </p>

        <div className="flex flex-col-reverse items-center w-full">
          <div className="w-full">
            <Line ref={chartRef} data={data} options={lineOptions} />
            <ChartFooter
              rawOrConvolve={value}
              handleStitch={handleStitch}
              handlePeak={handleShowPeak}
              resetZoom={resetZoom}
              zoomIn={zoomIn}
              zoomOut={zoomOut}
            />
          </div>
          <div className="px-4 mx-3 text-center">
            <FormControl>
              <FormLabel
                id="demo-row-controlled-radio-buttons-group"
                className="mr-3"
              >
                Select Curve to Display
              </FormLabel>
              <RadioGroup
                row
                aria-labelledby="demo-row-controlled-radio-buttons-group"
                name="row-controlled-radio-buttons-group"
                value={value}
                onChange={handleChange}
              >
                <CurveTypes />
              </RadioGroup>
            </FormControl>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DetectionChart;
