import e from "express";
// import db from "../../config/database.js";
import * as yup from "yup"; // install yup package for form validation
import { Version } from "../models";
import { UPDATE_URL } from "../config/constants";

const getCurrentVersion = async (req: any, res: any) => {
  var field: { version: string; };
  let validator = yup.object({
    version: yup.string().required(),
  });

  var status = "inactive";
  var versionExist = 0;
  var latest: Version;
  var update_url = UPDATE_URL;

  // validate the required fields
  try {
    field = validator.validateSync(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
  } catch (e) {
    const error = e as yup.ValidationError;
    return res.status(422).json({ errors: error.errors });
  }

  var versions = await Version.findAll();


  latest = versions[versions.length - 1];
  versions.forEach((e) => {
    var dbVersion = parseInt(e.version!.replaceAll(".", ""));
    var appVersion = parseInt(field.version.replaceAll(".", ""));

    if (appVersion == dbVersion) {
      versionExist++;

      if (e.status == "active") {
        if (appVersion < parseInt(latest.version!.replaceAll(".", ""))) {
          status = "update";
        } else {
          status = "active";
        }
      } else {
        status = "upgrade";
      }
    }
  });

  if (versionExist == 0) {
    res.status(500).json({
      status: "notExist",
      latest: latest.version,
      update_url: update_url,
    });
  } else {
    console.log("Sending result");
    res.status(200).json({
      status: status,
      latest: latest.version,
      update_url: update_url,
    });
  }
};

export default getCurrentVersion;
