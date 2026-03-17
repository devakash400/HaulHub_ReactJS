import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AddTrailerModal } from "../../components/TrailerDetails/AddTrailerModal.tsx";

const ListTrailer: React.FC = () => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(true);

  useEffect(() => {
    setModalOpen(true);
  }, []);

  const handleClose = () => {
    setModalOpen(false);
    navigate("/", { replace: true });
  };

  const handleSuccess = () => {
    setModalOpen(false);
    navigate("/", { replace: true });
  };

  return (
    <AddTrailerModal
      isOpen={modalOpen}
      onClose={handleClose}
      onSuccess={handleSuccess}
    />
  );
};

export default ListTrailer;
