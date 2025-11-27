import { LLMConfig } from "@/types/llm_config";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Language = 'en' | 'zh';

interface UserConfigState {
  can_change_keys: boolean
  llm_config: LLMConfig
  language: Language
}

const initialState: UserConfigState = {
  llm_config: {},
  can_change_keys: false,
  language: 'en',
}

const userConfigSlice = createSlice({
  name: "userConfig",
  initialState: initialState,
  reducers: {
    setLLMConfig: (state, action: PayloadAction<LLMConfig>) => {
      state.llm_config = action.payload;
    },
    setCanChangeKeys: (state, action: PayloadAction<boolean>) => {
      state.can_change_keys = action.payload;
    },
    setLanguage: (state, action: PayloadAction<Language>) => {
      state.language = action.payload;
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('presenton-language', action.payload);
      }
    }
  },
});

export const { setLLMConfig, setCanChangeKeys, setLanguage } = userConfigSlice.actions;
export default userConfigSlice.reducer;