import asyncio
import json


class IconFinderService:
    def __init__(self):
        self.collection_name = "icons"
        self.chromadb_available = False
        self.client = None
        self.collection = None
        self.embedding_function = None
        
        # 尝试导入 chromadb
        try:
            import chromadb
            from chromadb.config import Settings
            from chromadb.utils.embedding_functions import ONNXMiniLM_L6_V2
            
            self.chromadb = chromadb
            self.Settings = Settings
            self.ONNXMiniLM_L6_V2 = ONNXMiniLM_L6_V2
            self.chromadb_available = True
            
            print("Initializing icons collection...")
            self.client = chromadb.PersistentClient(
                path="chroma", settings=Settings(anonymized_telemetry=False)
            )
            self._initialize_icons_collection()
            print("Icons collection initialized.")
        except ModuleNotFoundError:
            print("Warning: chromadb is not installed. Icon search functionality will be disabled.")
            print("To enable icon search, install chromadb: pip install chromadb")
        except Exception as e:
            print(f"Warning: Failed to initialize chromadb: {e}")
            print("Icon search functionality will be disabled.")

    def _initialize_icons_collection(self):
        if not self.chromadb_available:
            return
            
        try:
            self.embedding_function = self.ONNXMiniLM_L6_V2()
            self.embedding_function.DOWNLOAD_PATH = "chroma/models"
            self.embedding_function._download_model_if_not_exists()
            try:
                self.collection = self.client.get_collection(
                    self.collection_name, embedding_function=self.embedding_function
                )
            except Exception:
                with open("assets/icons.json", "r") as f:
                    icons = json.load(f)

                documents = []
                ids = []

                for i, each in enumerate(icons["icons"]):
                    if each["name"].split("-")[-1] == "bold":
                        doc_text = f"{each['name']} {each['tags']}"
                        documents.append(doc_text)
                        ids.append(each["name"])

                if documents:
                    self.collection = self.client.create_collection(
                        name=self.collection_name,
                        embedding_function=self.embedding_function,
                        metadata={"hnsw:space": "cosine"},
                    )
                    self.collection.add(documents=documents, ids=ids)
        except Exception as e:
            print(f"Warning: Failed to initialize icons collection: {e}")
            self.chromadb_available = False

    async def search_icons(self, query: str, k: int = 1):
        if not self.chromadb_available or self.collection is None:
            # 如果 chromadb 不可用，返回空列表
            return []
        
        try:
            result = await asyncio.to_thread(
                self.collection.query,
                query_texts=[query],
                n_results=k,
            )
            return [f"/static/icons/bold/{each}.svg" for each in result["ids"][0]]
        except Exception as e:
            print(f"Error searching icons: {e}")
            return []


ICON_FINDER_SERVICE = IconFinderService()
