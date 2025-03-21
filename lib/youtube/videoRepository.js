const { ObjectId } = require('mongodb');

export default class VideosRepository {
    constructor(client) {
        this.db = client.db('projetoia');
        this.collection = this.db.collection('video');
    }

    /**
     * Conta o número total de documentos na coleção.
     * @returns {Promise<number>}
     */
    async countVideos() {
        return await this.collection.countDocuments();
    }

    /**
     * Obtém uma lista paginada de canais.
     * @param {number} skip - Número de documentos a ignorar.
     * @param {number} limit - Número de documentos a retornar.
     * @returns {Promise<Array>}
     */
    async getPaginatedVideos(page, limit, filters = {}, options = {}) {
        const skip = (page - 1) * limit;
        const query = {};

        // Filtros existentes
        if (filters.channel_id) {
            query.channel_id = filters.channel_id;
        }
        if (filters.channels_ids) {
            query['channel._id'] = {
                $in: filters.channels_ids.map((id) => new ObjectId(id))
            };
        }
        if (filters._id) {
            query._id =  new ObjectId(filters._id)
           
        }
        if (filters.videos_urls) {
            query.url = { $in: filters.videos_urls };
        }
        if (filters.favorite) {
            query.favorite = true;
        }

        // Novos filtros
        if (filters.published_after) {
            query.published_at = { $gte: new Date(filters.published_after) };
        }
        if (filters.published_before) {
            query.published_at = { ...query.published_at, $lte: new Date(filters.published_before) };
        }
        if (filters.keywords_in_title) {
            query.title = { $regex: filters.keywords_in_title, $options: 'i' };
        }
        if (filters.keywords_in_title_presentation) {
            query.title_presentation = { $regex: filters.keywords_in_title_presentation, $options: 'i' };
        }
        if (filters.visible === "true") {
            query.visible = true;
        }
        if (filters.visible === "false") {
            query.visible = false;
        }
        if (filters.applied === "true") {
            query.applied = true;
        }
        if (filters.applied === "false") {
            query.applied = false;
        }
        if (filters.targets) {
            query['channel.targets'] = { $in: filters.targets };
        }
        if (filters.targetLanguage) {
            query['channel.targetLanguage'] = filters.targetLanguage;
        }
        if (filters.type_platforms) {
            query['channel.type_platforms'] = { $in: filters.type_platforms };
        }
        if (filters.adm_channel_id) {
            query['channel.adm_channels'] = {
                $elemMatch: {
                    $or: [
                        { _id: new ObjectId(filters.adm_channel_id) }, // Caso o `_id` seja um ObjectId
                        { _id: filters.adm_channel_id }               // Caso o `_id` seja uma string
                    ]
                }
            };
        }
        if (filters.channel_name) {
            query['channel.channel_name'] = { $regex: filters.channel_name, $options: 'i' };
        }
        if (filters.channel_name_presentation) {
            query['channel.channel_name_presentation'] = { $regex: filters.channel_name_presentation, $options: 'i' };
        }

        const sort = options.sort || { published_at: -1 };

        // Realiza a consulta paginada
        const results = await this.collection.find(query).sort(sort).skip(skip).limit(limit).toArray();
        
        return {
            data: results,
            totalItems: await this.collection.countDocuments(query),
            totalPages: Math.ceil((await this.collection.countDocuments(query)) / limit),
            limit,
            currentPage: page
        };
    }

    /**
     * Obtém todos os vídeos com ordenação.
     * @param {Object} filters - Filtros para buscar os vídeos.
     * @param {Object} options - Opções adicionais (como ordenação).
     * @returns {Promise<Array>}
     */
    async getAllVideos(filters = {}, options = {}) {
        const query = {};

        // Filtros existentes
        if (filters.channel_id) {
            query.channel_id = filters.channel_id;
        }
        if (filters.channels_ids) {
            query.channel_id = { $in: filters.channels_ids };
        }
        if (filters.videos_urls) {
            query.url = { $in: filters.videos_urls };
        }

        // Novos filtros
        if (filters.published_after) {
            query.published_at = { $gte: new Date(filters.published_after) };
        }
        if (filters.published_before) {
            query.published_at = { ...query.published_at, $lte: new Date(filters.published_before) };
        }
        if (filters.keywords_in_title) {
            query.title = { $regex: filters.keywords_in_title, $options: 'i' };
        }
        if (filters.keywords_in_title_presentation) {
            query.title_presentation = { $regex: filters.keywords_in_title_presentation, $options: 'i' };
        }
        if (filters.targets) {
            query['channel.targets'] = { $in: filters.targets };
        }
        if (filters.visible == "true") {
            query.visible = true;
        }
        if (filters.visible == "false") {
            query.visible = false;
        }
        if (filters.targetLanguage) {
            query['channel.targetLanguage'] = filters.targetLanguage;
        }
        if (filters.type_platforms) {
            query['channel.type_platforms'] = { $in: filters.type_platforms };
        }
        if (filters.adm_channel_id) {
            query['channel.adm_channel_id'] = filters.adm_channel_id;
        }
        if (filters.channel_name) {
            query['channel.channel_name'] = { $regex: filters.channel_name, $options: 'i' };
        }
        if (filters.channel_name_presentation) {
            query['channel.channel_name_presentation'] = { $regex: filters.channel_name_presentation, $options: 'i' };
        }

        // Define a ordenação padrão ou usa a ordenação fornecida
        const sort = options.sort || { published_at: -1 }; // Ordena do mais recente para o mais antigo

        // Executa a consulta com filtros e ordenação
        return await this.collection.find(query).sort(sort).toArray();
    }

    /**
     * Obtém um canal por Channel ID.
     * @param {string} channelId
     * @returns {Promise<Object>}
     */
    async getbyVideolId(id) {
        return await this.collection.findOne({ id });
    }

    /**
     * Insere um novo canal.
     * @param {Object} data
     * @returns {Promise<Object>}
     */
    async insertVideo(data) {
        return await this.collection.insertOne(data);
    }

    /**
     * Insere vários vídeos de forma bulk.
     * @param {Array<Object>} data - Array de objetos contendo os dados dos vídeos a serem inseridos.
     * @returns {Promise<Object>} - Resultado da operação de inserção.
     */
    async insertVideos(data) {
        if (!Array.isArray(data) || data.length === 0) {
            throw new Error("O parâmetro 'data' deve ser um array com pelo menos um item.");
        }

        try {
            return await this.collection.insertMany(data, { ordered: true });
        } catch (error) {
            console.error('Erro ao realizar bulk insert:', error.message);
            throw error;
        }
    }

    /**
     * Atualiza um vídeo existente.
     * @param {Object} filter - Critérios para encontrar o vídeo a ser atualizado.
     * @param {Object} updateData - Dados que serão atualizados no documento.
     * @returns {Promise<Object>} - Resultado da operação de atualização.
     */
    async update(updateData) {

        const id =  new ObjectId(updateData._id);

        
        const { _id, ...updates } = updateData;

        
        const updateResult = await this.collection.updateOne(
            { _id: id },
            { $set: updates }
        );




        return updateResult
    }

    /**
     * Atualiza o campo applied_videos no canal relacionado ao vídeo
     * e reflete as alterações nos vídeos associados ao canal.
     * @param {string} videoId - ID do vídeo cujo canal será atualizado.
     * @returns {Promise<Object>} - Informações do canal atualizado.
     */
    async updateChannelApplied(video) {
        // Obtém o ID do canal associado ao vídeo
        const channelId = video.channel_id;

        // Atualiza o campo applied_videos no canal
        const result = await this.db.collection('channel').findOneAndUpdate(
            { channelId }, // Filtro para localizar o canal
            { $inc: { applied_videos: 1 } }, // Incrementa o applied_videos
            { returnDocument: 'after' } // Retorna o documento atualizado
        );

        if (!result.value) {
            throw new Error('Canal não encontrado para o vídeo.');
        }

        const updatedChannel = result.value;

        // Atualiza todos os vídeos associados ao canal com os dados do canal atualizado
        await this.db.collection('video').updateMany({ channel_id: channelId }, { $set: { channel: updatedChannel } });

        // Atualiza o vídeo atual com o campo applied
        await this.db.collection('video').updateOne({ _id: new ObjectId(videoId) }, { $set: { applied: true } });

        return updatedChannel;
    }

    async enableDesable(_id) {
        const result = await this.collection.updateOne({ _id: id }, { $set: { visible: false } });
        return result;
    }

    
    async bulkUpdate(items) {
        try {
            // Mapeia os itens para operações de bulkWrite
            const bulkOperations = items.map((doc) => {
                const { _id, ...updateData } = doc; // Extrai o _id do documento
    
                return {
                    updateOne: {
                        filter: { _id: new ObjectId(_id) }, // Certifique-se de usar ObjectId
                        update: { $set: updateData }, // Atualiza com os dados restantes
                    },
                };
            });
    
            // Executa as operações de bulkWrite
            const result = await this.collection.bulkWrite(bulkOperations);
            console.log(`Atualizados com sucesso: ${result.modifiedCount} documentos.`);
            return result;
        } catch (err) {
            console.error("Erro ao atualizar os documentos em massa:", err);
            throw err;
        }
    }
    

/**
 * Insere vários documentos de forma bulk.
 * @param {Array<Object>} data - Array de objetos contendo os dados a serem inseridos.
 * @returns {Promise<Object>} - Resultado da operação de inserção.
 */
async bulkInsert(data) {
    if (!Array.isArray(data) || data.length === 0) {
        throw new Error("O parâmetro 'data' deve ser um array com pelo menos um item.");
    }

    try {
        const bulkOps = data.map((doc) => ({
            insertOne: { document: doc },
        }));

        return await this.collection.bulkWrite(bulkOps);
    } catch (error) {
        console.error("Erro ao realizar bulk insert:", error.message);
        throw error;
    }
}

}
