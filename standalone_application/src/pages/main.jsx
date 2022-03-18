import React from "react";
import DetectionChart from "../components/DectectionChart";
import DataDrawer from "../components/DataDrawer";

const MainPage = ({ chartData, peakData, bgFlux }) => {
  const [isOpen, setIsOpen] = React.useState(true);

  const handleOpen = (open) => {
    setIsOpen(open);
  };

  return (
    <>
      <DetectionChart
        chartData={chartData}
        isOpen={isOpen}
        peakData={peakData}
      />
      <DataDrawer handleOpen={handleOpen} data={peakData} bgFlux={bgFlux} />
    </>
  );
};

export default MainPage;