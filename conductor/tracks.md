# Tracks Registry

This document outlines all the tracks (features, bug fixes, chores) within the Schedule Extractor project. Each track is defined by a unique ID, a description, and a link to its dedicated folder containing its specification, plan, and metadata.

---

- [ ] **Track: A small change to the labour matrix logic needs to be done. Specifically when calculating sales targets, allowed hours, predicted gain/loss. The sales values I enter in the matrix are the upper limit of sales for the corresponding hours. Ex: The first record is $4613 and 64.1hrs this means from $0 - $4613 we can use 64.1hrs. Along with making this calulcation change also make a ui change to make this more understandable to the user. For each record in the labour matrix config display it in the format <LowerLimit> to <Upper Limit>. I haven't explicitly given the lower limit, and it doesn't need to be stored. It can simply be $0 for the first record and for every other record it will be the previous records upper limit + 1**
*Link: [./tracks/labour_matrix_enhancement_20260320/](./tracks/labour_matrix_enhancement_20260320/)*
