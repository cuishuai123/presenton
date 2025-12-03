"""
Wrapper around the `docling` library.

In some deployment environments (e.g. restricted servers without access to
PyTorch wheels), installing `docling` may fail.  Importing it at module import
time would then crash the whole FastAPI app.

To make the service more robust, we try to import `docling` lazily and fall
back to a clear runtime error if it is not available.
"""

from typing import Any

try:
    from docling.document_converter import (
        DocumentConverter,
        PdfFormatOption,
        PowerpointFormatOption,
        WordFormatOption,
    )
    from docling.datamodel.pipeline_options import PdfPipelineOptions
    from docling.datamodel.base_models import InputFormat

    _DOCLING_AVAILABLE = True
except ModuleNotFoundError:
    # `docling` is optional in some deployments – we handle this gracefully.
    DocumentConverter = PdfFormatOption = PowerpointFormatOption = WordFormatOption = (  # type: ignore[assignment]
        PdfPipelineOptions
    ) = InputFormat = Any  # type: ignore[assignment]
    _DOCLING_AVAILABLE = False


class DoclingService:
    def __init__(self):
        if not _DOCLING_AVAILABLE:
            # Delay the error until the service is actually used, so that the
            # rest of the FastAPI app can still run.
            raise RuntimeError(
                "docling is not installed in this environment. "
                "Document parsing features are disabled."
            )

        self.pipeline_options = PdfPipelineOptions()
        self.pipeline_options.do_ocr = False

        self.converter = DocumentConverter(
            allowed_formats=[InputFormat.PPTX, InputFormat.PDF, InputFormat.DOCX],
            format_options={
                InputFormat.DOCX: WordFormatOption(
                    pipeline_options=self.pipeline_options,
                ),
                InputFormat.PPTX: PowerpointFormatOption(
                    pipeline_options=self.pipeline_options,
                ),
                InputFormat.PDF: PdfFormatOption(
                    pipeline_options=self.pipeline_options,
                ),
            },
        )

    def parse_to_markdown(self, file_path: str) -> str:
        result = self.converter.convert(file_path)
        return result.document.export_to_markdown()
