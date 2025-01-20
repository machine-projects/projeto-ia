import React, { useState } from "react";
import NavBarComponent from "./NavBarComponent";
import VideoFiltersComponent from "./VideoFiltersComponent";
import ExplorarVideosModal from "./ExplorarVideosModal";

const VideoDisplayComponent = ({
  videos,
  loading,
  page,
  totalPages,
  handlePageChange,
  filters,
  setFilters,
  fetchVideos,
}) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const handleExploreVideo = (video) => {
    setSelectedVideo(video);
    setModalOpen(true);
  };

  return (
    <div>
      <NavBarComponent active="home" />
      <div className="container bg-light py-4">
        <h2>Todos os Vídeos</h2>

        {/* Filtros */}
        <VideoFiltersComponent
          filters={filters}
          setFilters={setFilters}
          onApplyFilters={fetchVideos}
        />

        {/* Exibição de vídeos */}
        {loading ? (
          <div className="text-center">Carregando...</div>
        ) : (
          <div className="row">
            {videos.map((video) => (
              <div className="col-md-4 mb-3" key={video._id}>
                <div className="card">
                  <img
                    src={video.thumbnails[3]?.url || video.image}
                    alt={video.title}
                    className="card-img-top"
                  />
                  <div className="card-body">
                    <h5 className="card-title">{video.title_presentation}</h5>
                    <p className="card-text text-muted">
                      Canal: {video.channel?.channel_name_presentation || "N/A"}
                    </p>
                    <p className="card-text text-muted">
                      Visualizações: {video.views?.pretty || "N/A"}
                    </p>
                    <p className="card-text text-muted">
                      Publicado em:{" "}
                      {new Date(video.published_at).toLocaleDateString() || "N/A"}
                    </p>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleExploreVideo(video)}
                    >
                      Explorar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paginação */}
        <div className="pagination mt-4 d-flex justify-content-between">
          <button
            className="btn btn-secondary"
            onClick={() => handlePageChange("prev")}
            disabled={page === 1}
          >
            Anterior
          </button>
          <span>
            Página {page} de {totalPages}
          </span>
          <button
            className="btn btn-secondary"
            onClick={() => handlePageChange("next")}
            disabled={page === totalPages}
          >
            Próxima
          </button>
        </div>
      </div>

      {/* Modal para explorar vídeo */}
      {isModalOpen && selectedVideo && (
        <ExplorarVideosModal
          videoData={selectedVideo}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
};

export default VideoDisplayComponent;
