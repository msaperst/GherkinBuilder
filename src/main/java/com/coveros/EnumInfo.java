package com.coveros;

import com.coveros.exception.MalformedMethod;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

public class EnumInfo {

    private Logger log = Logger.getLogger("GherkinBuilder");

    private List<String> includes;
    private List<String> enumerations;

    public EnumInfo() {
        includes = new ArrayList<>();
        enumerations = new ArrayList<>();
    }

    /**
     * Returns the identified enumerations while parsing through the method
     * parameters
     *
     * @return List - a list of enumerations
     */
    public List<String> getGlueCodeEnumerations() {
        return enumerations;
    }

    public void addGlueCodeEnumeration(String enumeration) {
        if (!enumerations.contains(enumeration)) {
            enumerations.add(enumeration);
        }
    }

    /**
     * Returns the identified includes while parsing through the method
     * parameters
     *
     * @return List - a list of includes
     */
    public List<String> getClassIncludes() {
        return includes;
    }

    public void addClassInclude(String include) {
        if (!includes.contains(include)) {
            includes.add(include);
        }
    }

    public String buildEnum(BufferedReader br, String enumeration) throws IOException {
        String line;
        StringBuilder value = new StringBuilder();
        Boolean start = false;
        Boolean end = false;
        while ((line = br.readLine()) != null) {
            String ln = line.trim();
            if (start) {
                value.append(ln);
            }
            if (ln.startsWith("public enum " + enumeration)) {
                start = true;
                value.append(ln);
            }
            if (start && (ln.endsWith(";") || ln.endsWith("}"))) {
                end = true;
            }
            if (end) {
                return formatEnumValues(value.toString());
            }
        }
        return null;
    }

    public List<String> getStepEnumerations() throws IOException {
        List<String> enums = new ArrayList<>();
        for (String enumeration : enumerations) {
            try (BufferedReader br = new BufferedReader(new FileReader(getEnumFile(enumeration)));) {
                enums.add(buildEnum(br, enumeration));
            }
        }
        return enums;
    }

    public File getEnumFile(String enumeration) throws IOException {
        for (String include : getClassIncludes()) {
            if (include.endsWith("." + enumeration)) {
                include = include.replaceAll("\\.", "/");
                File enumFile = new File(System.getProperty("baseDirectory") + include + ".java");
                if (enumFile.exists()) {
                    return enumFile;
                }
                include = include.substring(0, include.lastIndexOf('/'));
                enumFile = new File(System.getProperty("baseDirectory") + include + ".java");
                if (enumFile.exists()) {
                    return enumFile;
                }
            }
        }
        String error = "There is a problem with your enum declaration. The defining enumeration file " +
                "is not properly identified. Please update your code appropriately where referencing '" + enumeration +
                "'";
        log.log(Level.SEVERE, error);
        throw new MalformedMethod(error);
    }

    public String formatEnumValues(String value) {
        String trim = value.substring(12);
        String enumName = trim.split(" ")[0];
        String enumVals = trim.substring(trim.indexOf('{') + 1);
        while (enumVals.endsWith(";") || enumVals.endsWith("}")) {
            enumVals = enumVals.substring(0, enumVals.length() - 1);
        }
        while (enumVals.contains("(")) {
            enumVals = enumVals.replaceAll("(\\([^\\)\\(]+\\))", "");
        }
        enumVals = enumVals.replace(" ", "");
        String array = "var " + enumName + " = new Array(\"";
        array += enumVals.replace(",", "\",\"");
        array += "\");";
        return array;
    }
}