'use client'
import LibrayCompo from "../../../ui-components/components/LibraryCompo";
import LoginDetailForm from "../../../ui-components/components/LoginDetailForm";
import { SettingsModal } from "../../../ui-components/components/SettingModal";
import { ThemeProvider } from "../../../ui-components/hooks/useTheme";
import "../../../ui-components/index.css"

const TestPage = () =>{
    return(
        <ThemeProvider>
            <SettingsModal />
        </ThemeProvider>
    )
}

export default TestPage;